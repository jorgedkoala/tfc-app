#FIRMAR aab
echo FIRMAR EL Bundle aab

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore /Users/jorged/keystore/tfc ./platforms/android/app/build/outputs/bundle/release/app-release.aab tfc

#ALINEAR Y RENOMBRAR