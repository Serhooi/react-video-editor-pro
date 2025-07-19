# Быстрая настройка S3 для загрузки файлов

## 1. Создай S3 bucket в AWS Console

1. Зайди в AWS Console → S3
2. Создай новый bucket с именем `video-editor-media` (или любым другим)
3. Регион: `us-east-1`

## 2. Настрой публичный доступ

В настройках bucket:

### Block Public Access
- Сними все галочки в "Block Public Access settings"

### Bucket Policy
Добавь эту политику в "Bucket policy":

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::video-editor-media/*"
    }
  ]
}
```

### CORS Configuration
Добавь эту CORS конфигурацию:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## 3. Обнови переменные в Vercel

В Vercel Dashboard добавь:
- `AWS_S3_BUCKET=video-editor-media`
- `AWS_REGION=us-east-1`

## 4. Готово!

После этого файлы должны загружаться и отображаться корректно.

## Альтернатива: Автоматическая настройка

Запусти скрипт:
```bash
node create-s3-bucket.js
```

Убедись, что в `.env.local` есть AWS credentials.