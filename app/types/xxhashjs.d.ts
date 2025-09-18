declare module "xxhashjs" {
    export function h32(data: string | Buffer, seed: number): { toString(radix?: number): string };
    export function h64(data: string | Buffer, seed: number): { toString(radix?: number): string };
}