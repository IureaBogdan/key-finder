#include "../gpio/kf_gpio_task_config.h"
#include "kf_ble_server.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "freertos/event_groups.h"

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <string.h>

#include "../gpio/kf_gpio_task_config.h"
#include "../kf_defs.h"

bool gv_isPaired = false;
xQueueHandle ble_rcv_queue = NULL;

static uint8_t char1_str[] = {0x11, 0x22, 0x33};
static esp_gatt_char_prop_t property = 0;
static prepare_type_env_t prepare_write_env;
static uint8_t adv_config_done = 0;

static esp_attr_value_t gatts_char1_val = {
    .attr_max_len = GATTS_CHAR_VAL_LEN_MAX,
    .attr_len = sizeof(char1_str),
    .attr_value = char1_str,
};

static bool isAuthorized = false;

/* ADV ID */
static uint8_t adv_service_uuid128[ESP_UUID_LEN_128] = {
    /* LSB <--------------------------------------------------------------------------------> MSB */
    0xfb,
    0x34,
    0x9b,
    0x5f,
    0x80,
    0x00,
    0x00,
    0x80,
    0x00,
    0x10,
    0x00,
    0x00,
    0xEE,
    0x00,
    0x00,
    0x00,
};

static esp_ble_adv_data_t adv_data = {
    .set_scan_rsp = false,
    .include_name = true,
    .include_txpower = false,
    .min_interval = 0x0006, //slave connection min interval, Time = min_interval * 1.25 msec
    .max_interval = 0x0010, //slave connection max interval, Time = max_interval * 1.25 msec
    .appearance = 0x00,
    .manufacturer_len = 0,
    .p_manufacturer_data = NULL,
    .service_data_len = 0,
    .p_service_data = NULL,
    .service_uuid_len = sizeof(adv_service_uuid128),
    .p_service_uuid = adv_service_uuid128,
    .flag = (ESP_BLE_ADV_FLAG_GEN_DISC | ESP_BLE_ADV_FLAG_BREDR_NOT_SPT),
};

static esp_ble_adv_data_t scan_rsp_data = {
    .set_scan_rsp = true,
    .include_name = true,
    .include_txpower = true,
    .appearance = 0x00,
    .manufacturer_len = 0,
    .p_manufacturer_data = NULL,
    .service_data_len = 0,
    .p_service_data = NULL,
    .service_uuid_len = sizeof(adv_service_uuid128),
    .p_service_uuid = adv_service_uuid128,
    .flag = (ESP_BLE_ADV_FLAG_GEN_DISC | ESP_BLE_ADV_FLAG_BREDR_NOT_SPT),
};

static esp_ble_adv_params_t adv_params = {
    .adv_int_min = 0x20,
    .adv_int_max = 0x40,
    .adv_type = ADV_TYPE_IND,
    .own_addr_type = BLE_ADDR_TYPE_PUBLIC,
    .channel_map = ADV_CHNL_ALL,
    .adv_filter_policy = ADV_FILTER_ALLOW_SCAN_ANY_CON_ANY,
};

static struct gatts_profile_inst gl_profile_tab[PROFILE_NUM] = {
    [PROFILE_APP_ID] = {
        .gatts_cb = kf_gatts_profile_event_handler,
        .gatts_if = ESP_GATT_IF_NONE,
    }};

/**
 * @brief Received messages handler.
 * @return Does not return - infinite loop.
*/
static void kf_handle_recv_message(void *arg)
{
    uint8_t *msg;
    for (;;)
    {
        if (xQueueReceive(ble_rcv_queue, &msg, portMAX_DELAY))
        {
            printf("Handler: ");
            printf((char*)msg);
            printf("\n");
            if (strcmp((char*)msg, SECURITY_CODE) == 0)
            {
                ESP_LOGI(GATTS_TAG, "CERERE DE AUTORIZARE");
                isAuthorized = true;
                kf_set_pin_on_high(LGREEN_PIN, 270);
                vTaskDelay(95 / portTICK_PERIOD_MS);
                kf_set_pin_on_high(LGREEN_PIN, 270);
                vTaskDelay(95 / portTICK_PERIOD_MS);
                kf_set_pin_on_high(LGREEN_PIN, 270);
            }
            else if (strcmp((char*)msg, FIND_ACCES_CODE) == 0)
            {
                ESP_LOGI(GATTS_TAG, "CERERE GĂSIRE DISPOZITIV");
                kf_find(4000);
            }
            else
            {
                ESP_LOGI(GATTS_TAG, "CEREREA NU POATE FI INTERPRETATĂ");
            }
        }
    }
}

/**
 * @brief GAP event handler
 * @return void
 */
static void gap_event_handler(esp_gap_ble_cb_event_t event, esp_ble_gap_cb_param_t *param)
{
    switch (event)
    {
    case ESP_GAP_BLE_ADV_DATA_SET_COMPLETE_EVT:
        adv_config_done &= (~adv_config_flag);
        if (adv_config_done == 0)
        {
            esp_ble_gap_start_advertising(&adv_params);
        }
        break;
    case ESP_GAP_BLE_SCAN_RSP_DATA_SET_COMPLETE_EVT:
        adv_config_done &= (~scan_rsp_config_flag);
        if (adv_config_done == 0)
        {
            esp_ble_gap_start_advertising(&adv_params);
        }
        break;
    case ESP_GAP_BLE_ADV_START_COMPLETE_EVT:
        if (param->adv_start_cmpl.status != ESP_BT_STATUS_SUCCESS)
        {
            ESP_LOGE(GATTS_TAG, "Porinirea serviciului de advertising a esuat\n");
        }
        break;
    case ESP_GAP_BLE_ADV_STOP_COMPLETE_EVT:
        if (param->adv_stop_cmpl.status != ESP_BT_STATUS_SUCCESS)
        {
            ESP_LOGE(GATTS_TAG, "Oprirea serviciului de advertising a esuat\n");
        }
        else
        {
            ESP_LOGI(GATTS_TAG, "Serviciul de advertising a fost oprit\n");
        }
        break;
    case ESP_GAP_BLE_UPDATE_CONN_PARAMS_EVT:
        break;
    default:
        break;
    }
}

/**
 * @brief GATTS event handler
 * @return void
 */
static void gatts_event_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param)
{
    /* If event is register event, store the gatts_if for each profile */
    if (event == ESP_GATTS_REG_EVT)
    {
        if (param->reg.status == ESP_GATT_OK)
        {
            gl_profile_tab[param->reg.app_id].gatts_if = gatts_if;
        }
        else
        {
            ESP_LOGI(GATTS_TAG, "Inregistrarea aplicatiei a esuat, status %d\n", param->reg.status);
            return;
        }
    }
    int idx;
    for (idx = 0; idx < PROFILE_NUM; idx++)
    {
        if (gatts_if == ESP_GATT_IF_NONE ||
            gatts_if == gl_profile_tab[idx].gatts_if)
        {
            if (gl_profile_tab[idx].gatts_cb)
            {
                gl_profile_tab[idx].gatts_cb(event, gatts_if, param);
            }
        }
    }
}

/**
 * @brief GATTS profile handler
 * @return void
 */
void kf_gatts_profile_event_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param)
{
    switch (event)
    {
    case ESP_GATTS_REG_EVT:
    {
        ESP_LOGI(GATTS_TAG, "EVENIMENT DE ÎNREGISTRARE, Status={%d}, ID={%d}\n", param->reg.status, param->reg.app_id);
        gl_profile_tab[PROFILE_APP_ID].service_id.is_primary = true;
        gl_profile_tab[PROFILE_APP_ID].service_id.id.inst_id = 0x00;
        gl_profile_tab[PROFILE_APP_ID].service_id.id.uuid.len = ESP_UUID_LEN_16;
        gl_profile_tab[PROFILE_APP_ID].service_id.id.uuid.uuid.uuid16 = GATTS_SERVICE_UUID;

        esp_err_t set_dev_name_ret = esp_ble_gap_set_device_name(DEVICE_NAME);
        if (set_dev_name_ret)
        {
            ESP_LOGE(GATTS_TAG, "NUMELE DISPOZITIVULUI NU POATE FI SETAT, Cod eroare={%x}", set_dev_name_ret);
        }

        esp_err_t ret = esp_ble_gap_config_adv_data(&adv_data);
        if (ret)
        {
            ESP_LOGE(GATTS_TAG, "CONFIGURAREA DATELOR DE ADVERTISING A ESUAT, Cod eroare={%x}", ret);
        }
        adv_config_done |= adv_config_flag;

        ret = esp_ble_gap_config_adv_data(&scan_rsp_data);
        if (ret)
        {
            ESP_LOGE(GATTS_TAG, "CONFIGURAREA RASPUNSULUI SCANARII DATELOR DE ADVERTISING A ESUAT, Cod eroare={%x}", ret);
        }
        adv_config_done |= scan_rsp_config_flag;

        esp_ble_gatts_create_service(gatts_if, &gl_profile_tab[PROFILE_APP_ID].service_id, GATTS_NUM_HANDLE);
        break;
    }
    case ESP_GATTS_READ_EVT:
    {
        if (!isAuthorized)
        {
            ESP_LOGI(GATTS_TAG, "EVENIMENT DE CITIRE - NO DATA\n");
            esp_gatt_rsp_t rsp;
            memset(&rsp, 0, sizeof(esp_gatt_rsp_t));

            rsp.attr_value.handle = param->read.handle;
            rsp.attr_value.len = 7;

            rsp.attr_value.value[0] = 'N';
            rsp.attr_value.value[1] = 'O';
            rsp.attr_value.value[2] = ' ';
            rsp.attr_value.value[3] = 'D';
            rsp.attr_value.value[4] = 'A';
            rsp.attr_value.value[5] = 'T';
            rsp.attr_value.value[6] = 'A';

            esp_ble_gatts_send_response(gatts_if, param->read.conn_id, param->read.trans_id,
                                        ESP_GATT_OK, &rsp);
        }
        else
        {
            ESP_LOGI(GATTS_TAG, "EVENIMENT DE CITIRE - USER AUTORIZAT\n");
            esp_gatt_rsp_t rsp;
            memset(&rsp, 0, sizeof(esp_gatt_rsp_t));

            rsp.attr_value.handle = param->read.handle;
            rsp.attr_value.len = 8;
            rsp.attr_value.value[0] = 'E';
            rsp.attr_value.value[1] = 'F';
            rsp.attr_value.value[2] = 'T';
            rsp.attr_value.value[3] = '3';
            rsp.attr_value.value[4] = '2';
            rsp.attr_value.value[5] = '4';
            rsp.attr_value.value[6] = 'A';
            rsp.attr_value.value[7] = 'A';

            esp_ble_gatts_send_response(gatts_if, param->read.conn_id, param->read.trans_id,
                                        ESP_GATT_OK, &rsp);
            isAuthorized = false;
        }
        break;
    }
    case ESP_GATTS_WRITE_EVT:
    {
        ESP_LOGI(GATTS_TAG, "EVENIMENT DE SCRIERE");
        if (!param->write.is_prep)
        {
            esp_log_buffer_char(GATTS_TAG, param->write.value, param->write.len);
            xQueueSend(ble_rcv_queue, (void *)&param->write.value, (TickType_t)0);
        }

        esp_gatt_status_t status = ESP_GATT_OK;
        if (param->write.need_rsp)
        {
            if (param->write.is_prep)
            {
                if (prepare_write_env.prepare_buf == NULL)
                {
                    prepare_write_env.prepare_buf = (uint8_t *)malloc(PREPARE_BUF_MAX_SIZE * sizeof(uint8_t));
                    prepare_write_env.prepare_len = 0;
                    if (prepare_write_env.prepare_buf == NULL)
                    {
                        status = ESP_GATT_NO_RESOURCES;
                    }
                }
                else
                {
                    if (param->write.offset > PREPARE_BUF_MAX_SIZE)
                    {
                        status = ESP_GATT_INVALID_OFFSET;
                    }
                    else if ((param->write.offset + param->write.len) > PREPARE_BUF_MAX_SIZE)
                    {
                        status = ESP_GATT_INVALID_ATTR_LEN;
                    }
                }

                esp_gatt_rsp_t *gatt_rsp = (esp_gatt_rsp_t *)malloc(sizeof(esp_gatt_rsp_t));
                gatt_rsp->attr_value.len = param->write.len;
                gatt_rsp->attr_value.handle = param->write.handle;
                gatt_rsp->attr_value.offset = param->write.offset;
                gatt_rsp->attr_value.auth_req = ESP_GATT_AUTH_REQ_NONE;
                memcpy(gatt_rsp->attr_value.value, param->write.value, param->write.len);
                esp_err_t response_err = esp_ble_gatts_send_response(gatts_if, param->write.conn_id, param->write.trans_id, status, gatt_rsp);
                if (response_err != ESP_OK)
                {
                    ESP_LOGE(GATTS_TAG, "EROARE LA TRIMITEREA RASPUNSULUI\n");
                }
                free(gatt_rsp);
                if (status != ESP_GATT_OK)
                {
                    return;
                }
                memcpy(prepare_write_env.prepare_buf + param->write.offset,
                       param->write.value,
                       param->write.len);
                prepare_write_env.prepare_len += param->write.len;
            }
            else
            {
                esp_ble_gatts_send_response(gatts_if, param->write.conn_id, param->write.trans_id, status, NULL);
            }
        }
        break;
    }
    case ESP_GATTS_EXEC_WRITE_EVT:
        esp_ble_gatts_send_response(gatts_if, param->write.conn_id, param->write.trans_id, ESP_GATT_OK, NULL);
        if (prepare_write_env.prepare_buf)
        {
            free(prepare_write_env.prepare_buf);
            prepare_write_env.prepare_buf = NULL;
        }
        prepare_write_env.prepare_len = 0;
        break;
    case ESP_GATTS_MTU_EVT:
        ESP_LOGI(GATTS_TAG, "ESP_GATTS_MTU_EVT, MTU %d", param->mtu.mtu);
        break;
    case ESP_GATTS_UNREG_EVT:
        break;
    case ESP_GATTS_CREATE_EVT:
    {
        ESP_LOGI(GATTS_TAG, "CREARE SERVICIU DE ADVERTISING");
        gl_profile_tab[PROFILE_APP_ID].service_handle = param->create.service_handle;
        gl_profile_tab[PROFILE_APP_ID].char_uuid.len = ESP_UUID_LEN_16;
        gl_profile_tab[PROFILE_APP_ID].char_uuid.uuid.uuid16 = GATTS_CHAR_UUID;

        esp_ble_gatts_start_service(gl_profile_tab[PROFILE_APP_ID].service_handle);
        property = ESP_GATT_CHAR_PROP_BIT_READ | ESP_GATT_CHAR_PROP_BIT_WRITE;
        esp_err_t add_char_ret = esp_ble_gatts_add_char(gl_profile_tab[PROFILE_APP_ID].service_handle, &gl_profile_tab[PROFILE_APP_ID].char_uuid,
                                                        ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
                                                        property,
                                                        &gatts_char1_val, NULL);
        if (add_char_ret)
        {
            ESP_LOGE(GATTS_TAG, "EROARE LA CREAREA SERVICIULUI DE ADVERITISING, Cod eroare={%x}", add_char_ret);
        }
        break;
    }
    case ESP_GATTS_ADD_INCL_SRVC_EVT:
        break;
    case ESP_GATTS_ADD_CHAR_EVT:
    {
        uint16_t length = 0;
        const uint8_t *prf_char;

        ESP_LOGI(GATTS_TAG, "ADAUGARE DESCRIPTOR CARACTERISTICA\n");
        gl_profile_tab[PROFILE_APP_ID].char_handle = param->add_char.attr_handle;
        gl_profile_tab[PROFILE_APP_ID].descr_uuid.len = ESP_UUID_LEN_16;
        gl_profile_tab[PROFILE_APP_ID].descr_uuid.uuid.uuid16 = ESP_GATT_UUID_CHAR_CLIENT_CONFIG;

        esp_err_t get_attr_ret = esp_ble_gatts_get_attr_value(param->add_char.attr_handle, &length, &prf_char);
        if (get_attr_ret == ESP_FAIL)
        {
            ESP_LOGE(GATTS_TAG, "HANDLE ILLEGAL");
        }
        esp_err_t add_descr_ret = esp_ble_gatts_add_char_descr(gl_profile_tab[PROFILE_APP_ID].service_handle, &gl_profile_tab[PROFILE_APP_ID].descr_uuid,
                                                               ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE, NULL, NULL);
        if (add_descr_ret)
        {
            ESP_LOGE(GATTS_TAG, "ADAUGAREA DESCRIPTORULUI A ESUAT, Cod eroare={%x}", add_descr_ret);
        }
        break;
    }
    case ESP_GATTS_ADD_CHAR_DESCR_EVT:
    {
        gl_profile_tab[PROFILE_APP_ID].descr_handle = param->add_char_descr.attr_handle;
        ESP_LOGI(GATTS_TAG, "ADAUGAREA DESCRIPTORULUI A REUSIT, Status={%d}\n", param->add_char_descr.status);
        break;
    }
    case ESP_GATTS_DELETE_EVT:
        break;
    case ESP_GATTS_START_EVT:
    {
        ESP_LOGI(GATTS_TAG, "PORNINREA SERVICIULUI, Status={%d}\n", param->start.status);
        break;
    }
    case ESP_GATTS_STOP_EVT:
        break;
    case ESP_GATTS_CONNECT_EVT:
    {
        gv_isPaired = true;
        isAuthorized = false;
        esp_ble_conn_update_params_t conn_params = {0};
        memcpy(conn_params.bda, param->connect.remote_bda, sizeof(esp_bd_addr_t));
        conn_params.latency = 0;
        conn_params.max_int = 0x20; // max_int = 0x20*1.25ms = 40ms
        conn_params.min_int = 0x10; // min_int = 0x10*1.25ms = 20ms
        conn_params.timeout = 400;  // timeout = 400*10ms = 4000ms
        ESP_LOGI(GATTS_TAG, "EVENIMET DE CONECTARE, ID={%02x:%02x:%02x:%02x:%02x:%02x}",
                 param->connect.remote_bda[0], param->connect.remote_bda[1], param->connect.remote_bda[2],
                 param->connect.remote_bda[3], param->connect.remote_bda[4], param->connect.remote_bda[5]);
        gl_profile_tab[PROFILE_APP_ID].conn_id = param->connect.conn_id;

        //start sent the update connection parameters to the peer device.
        esp_ble_gap_update_conn_params(&conn_params);
        break;
    }
    case ESP_GATTS_DISCONNECT_EVT:
    {
        gv_isPaired = false;
        ESP_LOGI(GATTS_TAG, "EVENIMENT DE DECONECTARE, MOTIV={0x%x}", param->disconnect.reason);
        esp_ble_gap_start_advertising(&adv_params);
        break;
    }
    case ESP_GATTS_CONF_EVT:
        break;
    case ESP_GATTS_OPEN_EVT:
        break;
    case ESP_GATTS_CANCEL_OPEN_EVT:
        break;
    case ESP_GATTS_CLOSE_EVT:
        break;
    case ESP_GATTS_LISTEN_EVT:
        break;
    case ESP_GATTS_CONGEST_EVT:
        break;
    default:
        break;
    }
}

/**
 * @brief Bluetooth Low Energy configuration function
 * @return void
 */
void kf_config_bt()
{
    esp_err_t ret;

    ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND)
    {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    ESP_ERROR_CHECK(esp_bt_controller_mem_release(ESP_BT_MODE_CLASSIC_BT));

    esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
    ret = esp_bt_controller_init(&bt_cfg);
    if (ret)
    {
        ESP_LOGE(GATTS_TAG, "%s Initializarea controller-ului BT a esuat: %s\n", __func__, esp_err_to_name(ret));
        return;
    }

    ret = esp_bt_controller_enable(ESP_BT_MODE_BLE);
    if (ret)
    {
        ESP_LOGE(GATTS_TAG, "%s Activarea controller-ului BT a esuat: %s\n", __func__, esp_err_to_name(ret));
        return;
    }

    ret = esp_bluedroid_init();
    if (ret)
    {
        ESP_LOGE(GATTS_TAG, "%s Initializarea BT a esuat: %s\n", __func__, esp_err_to_name(ret));
        return;
    }

    ret = esp_bluedroid_enable();
    if (ret)
    {
        ESP_LOGE(GATTS_TAG, "%s Activarea BT a esuat: %s\n", __func__, esp_err_to_name(ret));
        return;
    }

    ret = esp_ble_gatts_register_callback(gatts_event_handler);
    if (ret)
    {
        ESP_LOGE(GATTS_TAG, "INREGISTRAREA PROFILULUI GENERIC DE ATRIBUT A ESUAT, Cod eroare={%x}", ret);
        return;
    }

    ret = esp_ble_gap_register_callback(gap_event_handler);
    if (ret)
    {
        ESP_LOGE(GATTS_TAG, "INREGISTRAREA PROFILULUI GENERIC DE ACCES A ESUAT, Cod eroare={%x}", ret);
        return;
    }

    ret = esp_ble_gatts_app_register(PROFILE_APP_ID);
    if (ret)
    {
        ESP_LOGE(GATTS_TAG, "INREGISTRAREA ID-ULUI APLICATIEI A ESUAT = %x", ret);
        return;
    }

    esp_err_t local_mtu_ret = esp_ble_gatt_set_local_mtu(23);
    if (local_mtu_ret)
    {
        ESP_LOGE(GATTS_TAG, "MTU NU A PUTUT FI SETAT, Cod eroare={%x}", local_mtu_ret);
    }

    gv_isPaired = false;
    ble_rcv_queue = xQueueCreate(10, MESSAGE_LEN * sizeof(char *));
    xTaskCreate(kf_handle_recv_message, "kf_handle_recv_message", 8192, NULL, 10, NULL);
}