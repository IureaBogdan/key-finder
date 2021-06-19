#ifndef _KF_GPIO_TASK_CONFIG_H_
#define _KF_GPIO_TASK_CONFIG_H_

/**
 * @brief GPIO configuration function.
 * @return void
 */
void kf_config_gpio();

/**
 * @brief Turns on the buzzer and the leds for timeInMillis milliseconds
 * @return void
 */
void kf_find(int timeInMillis);

/**
 * @brief Sets a GPIO pin on HIGH(1) for timeInMillis milliseconds
 * @return void
 */
void kf_set_pin_on_high(int pin, int timeInMillis);
#endif