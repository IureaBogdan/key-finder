#include "kfutils.h"

void alternate_fast_blink(int timeInMillis){
        int delay = 200;
        while(timeInMillis>=0){
            gpio_set_level(LGREEN_PIN, 1);
            vTaskDelay(delay / portTICK_PERIOD_MS);
            gpio_set_level(LGREEN_PIN, 0);

            gpio_set_level(LBLUE_PIN, 1);
            vTaskDelay(delay / portTICK_PERIOD_MS);
            gpio_set_level(LBLUE_PIN, 0);

            gpio_set_level(LRED_PIN, 1);
            vTaskDelay(delay / portTICK_PERIOD_MS);
            gpio_set_level(LRED_PIN, 0);

            timeInMillis -= delay *3; 
        }
}

void buzz(int timeInMillis){
    int delayHigh = 5;
    while(timeInMillis>=0){
       gpio_set_level(BUZZER_PIN, 1);
       vTaskDelay(delayHigh / portTICK_PERIOD_MS);

       gpio_set_level(BUZZER_PIN, 0);
       vTaskDelay(delayHigh / portTICK_PERIOD_MS);

       timeInMillis -= (delayHigh*2);
    }
}