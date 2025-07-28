/**
 * Use autocomplete to get a list of available regions.
 * @type {import('@remotion/lambda').AwsRegion}
 */
export const REGION = "us-east-1";

export const SITE_NAME = "sams-site";
export const RAM = 3008; // Максимум для бесплатного тарифа AWS
export const DISK = 10240;
export const TIMEOUT = 300; // Увеличиваем timeout для сложных рендеров
