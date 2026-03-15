import { useQuery } from "@tanstack/vue-query";
import WebApp from "@twa-dev/sdk";

// Функция запроса
const fetchVerify = async () => {
    const res = await fetch("https://ai-box-cars.ru:8000/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: WebApp.initData }),
    });
    if (!res.ok) throw new Error("Ошибка запроса");
    const json = await res.json();
    return json.user;
}

export function useUser() {
    return useQuery({
        queryKey: ['verify', WebApp.initData],
        queryFn: fetchVerify,
        initialData: WebApp.initDataUnsafe.user,
        staleTime: 0,
    })
}