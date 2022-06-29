import { zeroPad } from "./string";

export function get_date(d = new Date()): string {
    const iso = d.toISOString().split("T");
    const date = iso[0];

    return date;
}

export function getGameCountdown() {
    const now = new Date().getTime() / 1000;
    const next = Math.floor((now + 86400) / 86400) * 86400;

    const countdown = new Date((next - now) * 1000);

    const h = zeroPad(countdown.getHours(), 2);
    const m = zeroPad(countdown.getMinutes(), 2);
    const s = zeroPad(countdown.getSeconds(), 2);

    return `${h}:${m}:${s}`;
}