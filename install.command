//install

adb devices

if [ "$1" == "debug" ]; then
    echo "Install Degug"
    adb install -r /Users/jorged/Clientes/tfc-app-v5/platforms/android/app/build/outputs/apk/debug/app-debug.apk
else
    echo "Install Prod version $1"
    adb install -r /Users/jorged/Clientes/tfc-app-v5/platforms/android/app/build/outputs/apk/release/"$1"
fi

