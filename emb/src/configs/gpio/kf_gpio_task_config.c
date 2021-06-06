#include <stdio.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "freertos/event_groups.h"

#include "driver/ledc.h"
#include "driver/gpio.h"

#include "esp_err.h"
#include "esp_log.h"

#include "kf_gpio_task_config.h"
#include "../kf_defs.h"
extern bool gv_isPaired;
xQueueHandle gpio_evt_queue = NULL;

// ledc channel config
static ledc_channel_config_t ledc_channel = {
    .channel = LEDC_CHANNEL_0,
    .duty = 0,
    .gpio_num = BUZZER_PIN,
    .speed_mode = LEDC_HS_MODE,
    .hpoint = 0,
    .timer_sel = LEDC_HS_TIMER
};

// ledc timer config
static ledc_timer_config_t ledc_timer = {
    .duty_resolution = LEDC_TIMER_13_BIT,
    .freq_hz = FREQUECY,
    .speed_mode = LEDC_HS_MODE,
    .timer_num = LEDC_HS_TIMER,
    .clk_cfg = LEDC_AUTO_CLK,
};


void kf_set_pin_on_high(int pin, int timeInMillis)
{
    gpio_set_level(pin, HIGH);
    vTaskDelay(timeInMillis / portTICK_PERIOD_MS);
    gpio_set_level(pin, LOW);
}

/**
 * @brief Handler for interruption events. This function is forced
 *  into RAM for fast accessibility.
 * @return void
 */
static void IRAM_ATTR gpio_isr_handler(void *arg)
{
    uint32_t gpio_num = (uint32_t)arg;
    xQueueSendFromISR(gpio_evt_queue, &gpio_num, NULL);
}

/**
 * @brief Handler function for interruption event queue.
 * Used as callback.
 * @return Does not return.
*/
static void kf_button_action_task(void *arg)
{
    uint32_t io_num;
    for (;;)
    {
        if (xQueueReceive(gpio_evt_queue, &io_num, portMAX_DELAY))
        {
            if (gpio_get_level(io_num) == 1)
            {
                if (gv_isPaired)
                {
                    kf_set_pin_on_high(LBLUE_PIN, 1000);
                }
                else
                {
                    kf_set_pin_on_high(LRED_PIN, 1000);
                }
            }
        }
    }
}

void kf_config_gpio()
{
    gpio_config_t io_conf;

    io_conf.intr_type = GPIO_INTR_DISABLE;
    io_conf.mode = GPIO_MODE_OUTPUT;
    io_conf.pin_bit_mask = OUTPUT_MASK;
    io_conf.pull_down_en = 0;
    io_conf.pull_up_en = 0;
    gpio_config(&io_conf);

    io_conf.intr_type = GPIO_INTR_POSEDGE;
    io_conf.mode = GPIO_MODE_INPUT;
    io_conf.pin_bit_mask = INPUT_MASK;
    gpio_config(&io_conf);

    ledc_timer_config(&ledc_timer);
    ledc_channel_config(&ledc_channel);
    ledc_fade_func_install(0);

    gpio_evt_queue = xQueueCreate(10, sizeof(uint32_t));

    xTaskCreate(kf_button_action_task, "kf_button_action_task", 2048, NULL, 10, NULL);

    gpio_install_isr_service(ESP_INTR_FLAG_LOWMED);
    gpio_isr_handler_add(BUTTON_PIN, gpio_isr_handler, (void *)BUTTON_PIN);
}

void kf_find(int timeInMillis)
{
    int timer = 0;
    int duration = 400;
    while (timer < timeInMillis)
    {
        esp_err_t res = ledc_set_duty(ledc_channel.speed_mode, ledc_channel.channel, duration);
        if (res == ESP_OK)
        {
            ledc_update_duty(ledc_channel.speed_mode, ledc_channel.channel);
        }

        int delay = 50;
        while (duration >= 0)
        {
            kf_set_pin_on_high(LGREEN_PIN, delay);
            kf_set_pin_on_high(LBLUE_PIN, delay);
            kf_set_pin_on_high(LRED_PIN, delay);
            duration -= delay * 3;
        }

        res = ledc_set_duty(ledc_channel.speed_mode, ledc_channel.channel, 0);
        if (res == ESP_OK)
        {
            ledc_update_duty(ledc_channel.speed_mode, ledc_channel.channel);
        }

        duration = 400;
        timer += duration;
        vTaskDelay(100 / portTICK_PERIOD_MS);
    }
    vTaskDelay(3000 / portTICK_PERIOD_MS);
}