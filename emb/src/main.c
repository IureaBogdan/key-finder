#include "kfutils.h"
static xQueueHandle gpio_evt_queue = NULL;

static void IRAM_ATTR gpio_isr_handler(void* arg)
{
    uint32_t gpio_num = (uint32_t) arg;
    xQueueSendFromISR(gpio_evt_queue, &gpio_num, NULL);
}

static void gpio_task(void* arg)
{
    uint32_t io_num;
    for(;;) {
        if(xQueueReceive(gpio_evt_queue, &io_num, portMAX_DELAY)) {
            printf("--- GPIO[%d] -> %d\n", io_num, gpio_get_level(io_num));
            if(gpio_get_level(io_num)==1){
                set_pin_on_high(LRED_PIN,500);
            }
            else if(gpio_get_level(io_num)==0){
                set_pin_on_high(LBLUE_PIN,500);
            }
            //alternate_fast_blink(4000);
        }
    }
}

void app_main()
{
    gpio_config_t io_conf;
    //disable interrupt
    io_conf.intr_type = GPIO_INTR_DISABLE;
    //set as output mode
    io_conf.mode = GPIO_MODE_OUTPUT;
    //set the output pin mask
    io_conf.pin_bit_mask = OUTPUT_MASK;
    //disable pull-down mode
    io_conf.pull_down_en = 0;
    //disable pull-up mode
    io_conf.pull_up_en = 0;
    //configure GPIO with the given settings
    gpio_config(&io_conf);

    //set posedge interrupt type
    io_conf.intr_type = GPIO_INTR_POSEDGE;
    //set as input mode
    io_conf.mode = GPIO_MODE_INPUT;
    //bit mask of the input pins
    io_conf.pin_bit_mask = INPUT_MASK;
    //configure GPIO with the given settings
    gpio_config(&io_conf);

    //create a queue to handle gpio event from isr
    gpio_evt_queue = xQueueCreate(10, sizeof(uint32_t));

    //start gpio task
    xTaskCreate(gpio_task, "gpio_task", 2048, NULL, 10, NULL);

    //install gpio isr service
    gpio_install_isr_service(ESP_INTR_FLAG_LOWMED);

    //hook isr handler for specific gpio pin
    gpio_isr_handler_add(BUTTON_PIN, gpio_isr_handler, (void*) BUTTON_PIN);

    int cnt = 0;
    while(true){
        printf("%d\n",cnt);
        vTaskDelay(1000 / portTICK_PERIOD_MS);
        cnt++;
    }
}