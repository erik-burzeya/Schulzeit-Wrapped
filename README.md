# Schulzeit Wrapped

A Spotify Wrapped–inspired web application that transforms a German school report card into a personalized end-of-year recap.

Users simply upload a report card, and the application extracts grades and attendance information to generate a set of interactive summary cards with interesting statistics and visual insights.

> **Note:** This project is intended as a fun demonstration of AI-powered document understanding and UI design.

---

## Features

- Upload a German report card (photo or PDF)
- AI-powered extraction of:
  - Grades
  - Excused absences
  - Unexcused absences
- Interactive "Wrapped"-style summary
- Mobile-first responsive design
- Privacy-conscious processing
- No permanent storage of uploaded documents

---

## How it works

1. The user uploads a report card.
2. The AI extracts only the information required for the recap.
3. The extracted values are shown for user confirmation.
4. Confirmed values are combined with predefined educational statistics.
5. A personalized "School Year Wrapped" is generated.

---

## Privacy

The application intentionally extracts only the data necessary to generate the recap.

- Uploaded documents are **not stored permanently**.
- Personal information outside grades and attendance is ignored.
- Users should avoid uploading documents containing sensitive information if they are uncomfortable sharing them with the AI service.

---

## Tech Stack

- Google AI Studio
- Gemini
- HTML
- CSS
- JavaScript

---

## Limitations

This project is intended as a personal showcase and small-scale demo.

Depending on the available Google AI Studio quota, requests may temporarily fail if usage limits are reached.

---

## Running the project

Clone the repository and follow the setup instructions provided by Google AI Studio for deploying AI Studio web applications.

---

## Roadmap

- [x] Better animations
- [ ] Additional recap cards
- [ ] More educational statistics
- [ ] Share-View


---

## Disclaimer

The generated statistics (such as estimated homework completed or lessons attended) are approximations based on publicly available educational statistics and should not be interpreted as exact values.

This project is not affiliated with any school, educational authority, or Google.

---

## License

This project is licensed under the MIT License.
