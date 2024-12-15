let correctAnswers = [];
let userScore = 0;
let gameHistory = [];
let gameNumber = 1;
let resultSubmitted = false;

// Shuffle array function
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Start game function
const startGame = () => {
    const playerPin = document.getElementById("playerPin").value;
    if (playerPin) {
        // Hide the login page and show the quiz page
        document.getElementById("loginPage").classList.add("hidden");
        document.getElementById("quizPage").classList.remove("hidden");
    } else {
        alert("Iltimos, PINni kiriting.");
    }
};

// Update history table
const updateHistoryTable = () => {
    const historyTableBody = document.getElementById('historyTableBody');
    if (!historyTableBody) {
        const historyTable = `
            <div class="mt-8">
                <h2 class="text-xl font-bold mb-4">O'yinlar tarixi</h2>
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="border p-2">O'yin №</th>
                            <th class="border p-2">Natija</th>
                            <th class="border p-2">Foiz</th>
                            <th class="border p-2">Sana</th>
                        </tr>
                    </thead>
                    <tbody id="historyTableBody"></tbody>
                </table>
            </div>
        `;
        document.getElementById('generatedQuestions').insertAdjacentHTML('afterend', historyTable);
    }

    const tableBody = document.getElementById('historyTableBody');
    tableBody.innerHTML = gameHistory.map(game => `
        <tr class="hover:bg-gray-50">
            <td class="border p-2 text-center">${game.gameNumber}</td>
            <td class="border p-2 text-center">${game.score}/${game.total}</td>
            <td class="border p-2 text-center">${game.percentage}%</td>
            <td class="border p-2 text-center">${game.date}</td>
        </tr>
    `).join('');
};

// Reset quiz
const resetQuiz = () => {
    correctAnswers = [];
    userScore = 0;
    gameNumber++;
    resultSubmitted = false;
    giveQuestions(); // Fetch new questions
};

// Check answers
const checkAnswers = () => {
    if (resultSubmitted) return;

    userScore = 0;
    const questions = document.querySelectorAll('.question-container');

    questions.forEach((question, index) => {
        const selectedAnswer = question.querySelector(`input[name="question${index}"]:checked`)?.nextElementSibling?.textContent;
        if (selectedAnswer === correctAnswers[index]) {
            userScore++;
            question.classList.add('bg-green-100');
        } else {
            question.classList.add('bg-red-100');
        }
    });

    const percentage = Math.round((userScore / correctAnswers.length) * 100);
    const currentDate = new Date().toLocaleString();

    gameHistory.push({
        gameNumber : gameNumber,
        score: userScore,
        total: correctAnswers.length,
        percentage: percentage,
        date: currentDate
    });

    document.getElementById('score').textContent = `Sizning natijangiz: ${userScore}/${correctAnswers.length} (${percentage}%)`;
    updateHistoryTable();

    const checkAnswersButton = document.getElementById('checkAnswers');
    if (checkAnswersButton) {
        checkAnswersButton.disabled = true;
        checkAnswersButton.classList.add('opacity-50', 'cursor-not-allowed');
    }

    resultSubmitted = true;
};

// Fetch questions from API
const giveQuestions = () => {
    const questionCount = document.getElementById("questionCount").value.toLowerCase();
    const questionDifficulty = document.getElementById("difficulty").value.toLowerCase();
    const questionType = document.getElementById("questionType").value.toLowerCase();
    const generatedQuestions = document.getElementById("generatedQuestions");
    generatedQuestions.innerHTML = "";

    axios
        .get(
            `https://opentdb.com/api.php?amount=${questionCount}&difficulty=${questionDifficulty}&type=${questionType}`
        )
        .then((res) => {
            console.log(res.data.results);

            correctAnswers = res.data.results.map(question => question.correct_answer);

            res.data.results.forEach((result, index) => {
                const allAnswers = [...result.incorrect_answers, result.correct_answer];
                const shuffledAnswers = shuffleArray([...allAnswers]);

                generatedQuestions.innerHTML += `
                <div class="question-container bg-white p-6 rounded-lg shadow-md mb-4">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">Savol ${index + 1}</h3>
                    <p class="text-gray-600">${result.question}</p>
                    ${shuffledAnswers
                    .map(
                        (answer, answerIndex) => `
                            <div class="mt-4">
                                <input type="radio" name="question${index}" id="question${index}Option${answerIndex}" />
                                <label for="question${index}Option${answerIndex}">${answer}</label>
                            </div>
                        `
                    )
                    .join("")}
                </div>`;
            });

            generatedQuestions.innerHTML += `
                <div class="mt-6 flex gap-4">
                    <button id="checkAnswers" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Natijani tekshirish
                    </button>
                    <button id="playAgain" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Yana o'ynash
                    </button>
                </div>
                <div id="score" class="mt-4 text-xl font-bold"></div>`;

            document.getElementById("checkAnswers")?.addEventListener("click", checkAnswers);
            document.getElementById("playAgain")?.addEventListener("click", resetQuiz);
        })
        .catch((err) => {
            console.error(err);
            alert("Savollarni yuklashda xatolik yuz berdi. Qayta urinib ko'ring.");
        });
};

document.addEventListener("DOMContentLoaded", () => {
    const generateButton = document.getElementById("generateQuestions");
    if (generateButton) {
        generateButton.addEventListener("click", giveQuestions);
    }
});