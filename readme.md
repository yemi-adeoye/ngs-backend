1. Lauch EC@ instance connect
2. GRAB REDIS PASSWORD FROM API GATEWAY AND EXPOSE IT AS ENV VAR
3. START REDIS (`redis6-server`)
4. start users-ms `nohup java -jar users-ms.jar`
5. start logging app `setsid nohup node main.js &`, then press `CTRL + C` to exit nohup
