<script setup lang="ts">
import WebApp from "@twa-dev/sdk";
import { NButton, NCard } from "naive-ui";

WebApp.ready();
WebApp.expand();
//

const user = WebApp.initDataUnsafe.user;

WebApp.MainButton.setText("Hello");
WebApp.MainButton.show();
console.log(user);
</script>

<template>
    <n-card title="Profile">
        <p>{{ user?.first_name }}</p>

        <n-button
            type="primary"
            @click="
                () => {
                    WebApp.MainButton.setText('Test');
                    // window.Telegram.WebApp.sendData( JSON.stringify({test: true}) )
                    // WebApp.sendData(JSON.stringify(user))
                    WebApp.sendData(JSON.stringify({ test: true }));
                }
            "
        >
            Send TON
        </n-button>
    </n-card>
</template>

<style scoped></style>
