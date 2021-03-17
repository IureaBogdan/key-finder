#include "kfutils.h"

void set_pin_on_high(unsigned int pin, unsigned int timeInMillis){
    gpio_set_level(pin, HIGH);
    vTaskDelay(timeInMillis / portTICK_PERIOD_MS);
    gpio_set_level(pin, LOW);
}

void alternate_fast_blink(int timeInMillis){
        unsigned int delay = 200;
        while(timeInMillis>=0){

            set_pin_on_high(LGREEN_PIN, delay);
            set_pin_on_high(LBLUE_PIN, delay);
            set_pin_on_high(LRED_PIN, delay);

            timeInMillis -= delay *3; 
        }
}

void buzz(int timeInMillis){
    unsigned int delay = 5;

    while(timeInMillis>=0){
       set_pin_on_high(BUZZER_PIN, delay);
       timeInMillis -= delay;
    }
}

