#!/bin/bash

echo Inicio

#creamos el build

ionic cordova build android --release --prod



#FIRMAR APK
echo FIRMAR EL APK

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore /Users/jorged/keystore/tfc ./platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk tfc

#ALINEAR Y RENOMBRAR

#IR AL DIR

cd ./platforms/android/app/build/outputs/apk/release/

rm -f tfc_v37.apk
zipalign -v 4 app-release-unsigned.apk tfc_v37.apk

echo FIN DEL PROCESO