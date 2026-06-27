# Spectator — BE Requirements Note

> Gửi BE team. FE spectator đã hoàn thiện UI. Dưới đây là toàn bộ endpoints cần có,
> response schema FE đang expect, và business logic cần confirm.

---

## 1. Endpoints đã có — cần chỉnh response

### `GET /spectator/dashboard`

FE đang dùng các field sau:

```json
{
  "upcomingTournaments": 5,
  "predictionsSubmitted": 12,
  "rewardPoints": 1250,
  "myRank": 3,
  "featuredTournament": {
    "tournamentId": 1,
    "tournamentName": "Dubai Sprint Cup",
    "status": "OpenRegistration",
    "location": "Dubai Meydan",
    "prizePool": 2000000,
    "race": {
      "raceDate": "2025-08-01T10:00:00Z",
      "distanceMeters": 2400
    }
  }
}
```

> ⚠️ `myRank` là field mới — rank của spectator đang đăng nhập trong bảng predictor mùa này.

---

### `GET /spectator/tournaments`

Mỗi item cần thêm 2 field mới:

```json
[
  {
    "tournamentId": 1,
    "tournamentName": "Dubai Sprint Cup",
    "status": "OpenRegistration",
    "location": "Dubai Meydan",
    "prizePool": 2000000,
    "race": {
      "raceDate": "2025-08-01T10:00:00Z",
      "distanceMeters": 2400
    },
    "hasPredicted": false,
    "myPrediction": null
  }
]
```

Nếu spectator đã predict rồi:

```json
{
  "hasPredicted": true,
  "myPrediction": {
    "predictedHorseId": 5,
    "predictedHorseName": "Thunder",
    "isCorrect": null,
    "pointsAwarded": 0
  }
}
```

> ⚠️ `hasPredicted` + `myPrediction` là field mới. Hiện tại FE phải gọi thêm
> `GET /spectator/predictions/my` rồi tự map — nếu BE trả sẵn trong response
> tournament list sẽ tiết kiệm 1 request.

---

### `GET /spectator/predictions/my`

Response cũ chỉ có `raceName`. FE cần thêm:

```json
[
  {
    "predictionId": 1,
    "tournamentId": 3,
    "tournamentName": "Dubai Sprint Cup",
    "tournamentStatus": "Ongoing",
    "predictedHorseId": 5,
    "predictedHorseName": "Thunder",
    "isCorrect": null,
    "pointsAwarded": 0,
    "status": "Pending"
  }
]
```

> ⚠️ Cần `tournamentId` và `tournamentName` (hiện chỉ có `raceName`).
> Logic: 1 prediction/tournament — nếu spectator predict nhiều lần cùng 1 tournament
> thì BE phải reject và trả 400.

---

### `POST /spectator/predictions`

Payload thay đổi:

```json
// CŨ (sai):
{ "raceId": 5, "predictedHorseId": 12 }

// MỚI (đúng):
{ "tournamentId": 3, "predictedHorseId": 12 }
```

Validation BE cần enforce:
- Spectator chỉ được predict 1 lần / 1 tournament
- Tournament phải đang `OpenRegistration` hoặc `Scheduled` — nếu `Ongoing`/`Completed` thì reject
- Horse phải có trong danh sách đăng ký của tournament đó

Error response:
```json
{ "error": "You have already predicted for this tournament." }   // 409
{ "error": "Prediction period has ended for this tournament." } // 400
{ "error": "Horse is not registered in this tournament." }       // 400
```

---

### `GET /spectator/rewards`

Cần thêm field `myRank` và `pointHistory` dùng `tournamentName` thay vì `raceName`:

```json
{
  "rewardPoints": 1250,
  "correctPredictions": 8,
  "predictionAccuracy": 67,
  "myRank": 3,
  "pointHistory": [
    {
      "tournamentId": 1,
      "tournamentName": "Dubai Sprint Cup",
      "points": 100,
      "awardedAt": "2025-08-10T12:00:00Z"
    }
  ]
}
```

---

## 2. Endpoints mới cần tạo

### `GET /spectator/season/current`

```json
{
  "seasonId": 1,
  "startDate": "2025-07-01T00:00:00Z",
  "endDate": "2025-09-30T23:59:59Z",
  "daysLeft": 45,
  "totalDays": 92,
  "totalPredictors": 128,
  "totalPredictions": 340
}
```

> `totalDays` = tổng số ngày trong season (để FE tính progress bar).

---

### `GET /spectator/tournaments/:id/horses`

Danh sách ngựa đăng ký trong tournament — dùng cho prediction modal.

```json
[
  {
    "horseId": 5,
    "horseName": "Thunder",
    "ownerName": "John Smith",
    "jockeyName": "Ahmed Al-Rashid"
  }
]
```

> Có thể reuse từ horse management — chỉ cần filter horses trong tournament đó.

---

### `GET /spectator/leaderboard/horses`

Bảng xếp hạng ngựa theo hiệu suất trong mùa hiện tại.

```json
[
  {
    "rank": 1,
    "horseId": 5,
    "horseName": "Thunder",
    "ownerName": "John Smith",
    "wins": 3,
    "totalRaces": 4,
    "winRate": 75
  }
]
```

> `winRate` = phần trăm (0–100), không phải decimal.

---

### `GET /spectator/leaderboard/predictors`

Bảng xếp hạng spectator theo điểm dự đoán trong season hiện tại.

```json
[
  {
    "rank": 1,
    "spectatorId": 10,
    "spectatorName": "Nguyen Van A",
    "points": 450,
    "correctPredictions": 6,
    "accuracy": 85
  }
]
```

> `spectatorName` = tên hiển thị. FE highlight row nếu khớp với user đang đăng nhập.
> Trả tất cả hoặc giới hạn top 50 — FE tự cắt.

---

## 3. Business logic cần confirm

### Season management

| Câu hỏi | Ghi chú |
|---|---|
| Season có tự động tạo không? | Hay admin tạo thủ công qua admin panel? |
| Khi season kết thúc, ai trigger phát thưởng? | Job tự động hay admin bấm nút? |
| Reset points như thế nào? | `pointsAwarded` về 0, hay tạo bảng mới? |
| `totalDays` tính thế nào? | `endDate - startDate` hay fixed 90 ngày? |

### Prediction scoring

| Câu hỏi | Ghi chú |
|---|---|
| Điểm cho mỗi prediction đúng là bao nhiêu? | Fixed (ví dụ 100 pts) hay tùy prize pool? |
| Khi nào `isCorrect` được set? | Sau khi referee submit kết quả tournament? |
| Ngựa nào được coi là "thắng tournament"? | Ngựa thắng race đầu tiên? Tổng điểm nhiều nhất? |

---

## 4. Endpoints đã có nhưng FE chưa dùng (có thể bỏ hoặc dùng sau)

| Endpoint | Trạng thái |
|---|---|
| `GET /spectator/tournaments/:id` | Không có trang detail — có thể implement sau |
| `GET /spectator/races/:raceId/registrations` | Đã thay bằng `/tournaments/:id/horses` |
| `GET /spectator/notifications/unread-count` | Chưa dùng, có thể gắn vào sidebar badge |

---

## 5. Tóm tắt checklist cho BE

- [ ] `GET /spectator/season/current` — endpoint mới
- [ ] `GET /spectator/tournaments/:id/horses` — endpoint mới  
- [ ] `GET /spectator/leaderboard/horses` — endpoint mới
- [ ] `GET /spectator/leaderboard/predictors` — endpoint mới
- [ ] `GET /spectator/dashboard` — thêm `myRank`
- [ ] `GET /spectator/tournaments` — thêm `hasPredicted`, `myPrediction`
- [ ] `GET /spectator/predictions/my` — thêm `tournamentId`, `tournamentName`, `tournamentStatus`
- [ ] `POST /spectator/predictions` — đổi `raceId` → `tournamentId`, enforce 1/tournament
- [ ] `GET /spectator/rewards` — thêm `myRank`, `totalDays`, đổi `raceName` → `tournamentName`
- [ ] Confirm: scoring logic (bao nhiêu pts/prediction đúng?)
- [ ] Confirm: season management (auto hay manual?)
- [ ] Confirm: định nghĩa "winner" của tournament
