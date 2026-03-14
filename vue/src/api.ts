import { TonConnectUI, type ConnectedWallet } from "@tonconnect/ui";
import { withResolvers } from "./shared/utils/promise";
import { ref } from "vue";

let tonConnectUI: TonConnectUI | null = null;
const connectedWallet = ref<ConnectedWallet | null>(null)
const { promise: connectedWalletPromise, resolve, reject } = withResolvers();

export function connectTON() {
    if (tonConnectUI) {
        return { tonConnectUI, connectedWalletPromise, connectedWallet }
    }

    tonConnectUI = new TonConnectUI({
        manifestUrl: "https://ai-box-cars.ru/tonconnect-manifest.json",
    });

    tonConnectUI.onStatusChange((wallet) => {
        if (wallet) {
            connectedWallet.value = wallet
            resolve(wallet)
        }
        else reject()
    });

    return { tonConnectUI, connectedWalletPromise, connectedWallet }
}

