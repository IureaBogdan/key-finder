#include "configs/gpio/kf_gpio_task_config.h"
#include "configs/ble/kf_ble_server.h"

void app_main(void)
{
    kf_config_gpio();
    kf_config_bt();
}