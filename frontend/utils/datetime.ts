export function get_date(d = new Date()): string {
    const iso = d.toISOString().split("T"); 
    const date = iso[0];

    return date;
}