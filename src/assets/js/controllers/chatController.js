/**
 * @author Yusuf Calik
 * Controller for chat screen and user interaction
 * @class
 * @classdesc This controller handles the chat screen and user interaction.
 * @extends Controller
 * @property {ChatView} #chatView - The chat view instance.
 * @property {chatRepository} #chatRepository - The chat repository instance.
 */

import {Controller} from "./Controller.js";
import {chatRepository} from "../repositories/chatRepository.js";
import {App} from "../app.js";
import {ObaApiRepository} from "../repositories/obaApiRepository.js";
import {KeywordCheckRepository} from "../repositories/checkBookRepository.js";
import {TranslateRepository} from "../repositories/translateRepository.js";
import {HelpQuestionsRepository} from "../repositories/helpQuestionsRepository.js";

export class ChatController extends Controller {
    #chatView;
    #chatRepository;
    #userMessage;
    #userSession;
    #response;
    #placeholderText;
    #obaApi;
    #checkBookRepository;
    #translateText;
    #getHelpQuestions;

    constructor() {
        super();
        this.#chatRepository = new chatRepository();
        this.#obaApi = new ObaApiRepository();
        this.#checkBookRepository = new KeywordCheckRepository();
        this.#translateText = new TranslateRepository();
        this.#getHelpQuestions = new HelpQuestionsRepository();
        this.#userSession = App.sessionManager.get("userId")

        this.#setupView();
        this.#showHistorie();
    }

    /**
     * @author Yusuf Çalik
     * Sets up the view and event listeners
     */
    async #setupView() {
        // Laad de HTML pagina, deze staat in de html_views map en is genaamd "chat.html"
        // Dit ("chat.html") kan je naar elk html bestandje veranderen
        this.#chatView = await super.loadHtmlIntoContent("html_views/chat.html")
        console.log(this.#userSession);
        // In "chat.html" zou een knop moeten staan met id="search-button".
        // Als je op deze knop drukt wordt de methode (function) "handleChatQuestion" gerund.
        this.#chatView.querySelector("#submit-button").addEventListener("click", event => this.#handleChatQuestion(event));
        this.#chatView.querySelector("#user-input").addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                this.#handleChatQuestion(e);
            }
        })
        this.#chatView.querySelector(".button-group").addEventListener("click", e => this.#helpButton(e));
        this.#chatView.querySelector(".historie-box").addEventListener("click", e => this.#buttonLoop(e));
        this.#chatView.querySelector(".delete-button").addEventListener("click", e => this.#saveQuestions(e));
        this.#placeholderText = this.#chatView.querySelector("#placeholder-text");

        const startButton = this.#chatView.querySelector("#speech-to-text-button");
        startButton.addEventListener("click", () => {
            event.preventDefault();//prevent actual submit and page refresh
            this.#startSpeechToText();
        });

        const languageSelect = this.#chatView.querySelector('#language-select');
        languageSelect.addEventListener("change", () => {
            this.#languageChange()
            this.#translate()
        });

        await this.#getFromDatabase();
    }

    /**
     * Function for the help questions buttons when user clicks on it the question and answer will be displayed in the
     * message box
     * @author Yusuf Çalik
     * @param e
     * @returns {Promise<void>}
     */
    async #helpButton(e) {
        const button = e.target;
        try {
            if (button.tagName === "BUTTON") {
                const question = button.textContent;

                this.#userMessage = document.createElement("div");
                this.#userMessage.classList.add("user-message");
                this.#userMessage.textContent = question;

                //delete the default text in the message box
                this.#placeholderText.style.display = "none";

                // add the user's message to the message-box in the frontend
                const messageBox = this.#chatView.querySelector(".message-box");
                messageBox.appendChild(this.#userMessage);

                const answer = await this.#getAnswerForQuestion(question);
                console.log(answer)
                this.#createMessage(answer)
            }
        } catch (e) {
            console.log(e)
            // show error message
            const errorMessage = "Er is een fout opgelopen bij het antwoorden! Probeer het later opnieuw."
            this.#createMessage(errorMessage)
        }
    }

    /**
     * Gets the help questions from the database and updates the corresponding divs in the chat view.
     * @author Yusuf Çalik
     * @returns {Promise<void>}
     */
    async #getFromDatabase() {
        const divs = this.#chatView.querySelectorAll('.replace');
        const helpQuestions = await this.#getHelpQuestions.selectQuestion();

        if (divs.length === helpQuestions.length) {
            divs.forEach((div, index) => {
                div.textContent = helpQuestions[index].question;
            });
        }
    }

    /**
     * Retrieves the answer that belongs to the given question from the database.
     * @author Yusuf Çalik
     * @param question
     * @returns {Promise<*|null>}
     */
    async #getAnswerForQuestion(question) {
        const helpQuestions = await this.#getHelpQuestions.selectQuestion();

        for (const helpQuestion of helpQuestions) {
            if (helpQuestion.question === question) {
                return helpQuestion.answer;
            }
        }
        // Return null if no matching question is found
        return null;
    }

    /**
     * Detect if the language changes
     * @author Armando Labega
     * @returns {string | number | any} - The selected language value
     */
    #languageChange() {
        const languageSelect = this.#chatView.querySelector('#language-select');
        return languageSelect.value
    }

    /**
     * Gets the words that have to be translated and the language and sends it to the translate api
     * @author Armando Labega
     * @returns {Promise<void>}
     */
    async #translate() {
        const wordsList = Array.from(document.querySelectorAll('.translate'));

        try {
            await Promise.all(wordsList.map(async (words) => {
                const text = words.textContent;
                console.log(text);

                const language = this.#languageChange();

                const vertaal = await this.#translateText.translating(text, language);
                words.textContent = vertaal.output;
            }));
        } catch (e) {
            console.log(e)
            const messagebox = this.#chatView.querySelector('.message-box');
            const searchError = this.#chatView.createElement('div');
            searchError.textContent = 'Er is iets fout gegaan tijdens het vertalen! Meld dit bij een medewerker ' +
                'en probeer het later opnieuw.';
            messagebox.appendChild(searchError);
        }

    }

    #startSpeechToText() {
        const recognition = new window.webkitSpeechRecognition();
        recognition.onresult = (event) => {
            const speechToText = event.results[0][0].transcript;
            this.#chatView.querySelector("#user-input").value = speechToText;
        };
        recognition.start();
    }

    /**
     * @author Yusuf Çalik
     * Sends user's message to the server and displays it in the chat
     * @param event - submit event
     * @returns {boolean}
     */
    async #handleChatQuestion(event) {
        //prevent actual submit and page refresh
        event.preventDefault();

        //load the user history
        await this.#showHistorie();

        // get the input from the search bar (input text field)
        const question = this.#chatView.querySelector("#user-input").value;

        // clear the input field
        this.#chatView.querySelector("#user-input").value = '';

        // create a new div element to hold the user's message
        this.#userMessage = document.createElement("div");
        this.#userMessage.classList.add("user-message");
        this.#userMessage.textContent = question;

        //delete the default text in the message box
        this.#placeholderText.style.display = "none";

        // add the user's message to the message-box in the frontend
        const messageBox = this.#chatView.querySelector(".message-box");
        messageBox.appendChild(this.#userMessage);

        // create a new div element to hold the loading message
        const loadingMessage = document.createElement("div");
        loadingMessage.classList.add("bot-message");
        loadingMessage.textContent = "OBI is aan het denken...";

        // add the loading message to the message-box in the frontend
        messageBox.appendChild(loadingMessage);
        messageBox.scrollTop = messageBox.scrollHeight;

        try {
            // send the question to ChatRepository to search if the question is in the user history database and wait for the response
            this.#response = await this.#chatRepository.getUserHistoryMessage(question, this.#userSession);

            if (this.#response.results !== null) {
                messageBox.removeChild(loadingMessage);
                this.#createMessage(this.#response.results[0].answer);
                return;
            }

            // send the question to ChatRepository to search if the question is in the database and wait for the response
            this.#response = await this.#chatRepository.commonQuestions(question, this.#userSession);

            if (this.#response.results !== null) {
                messageBox.removeChild(loadingMessage);
                this.#createMessage(this.#response.results[0].answer);
                return;
            }

            // send the question to ChatRepository to ask chatGPT and wait for the response
            this.#response = await this.#chatRepository.chatgptAPI(question);


            // author: Armando Labega
            // Gets the book from the chat-gpt response and gives it to the oba API
            const responseForBook = await this.#checkBookRepository.getKeyword(question);
            const bookTitle = responseForBook.keyword;
            console.log(bookTitle)

            if (bookTitle !== null && bookTitle !== '') {
                try {
                    // Search for books using the OBA API
                    const results = await this.#obaApi.searchOba(bookTitle);
                    messageBox.removeChild(loadingMessage);
                    // Display the search results
                    this.displayResults(results);
                    this.#createMessage(this.#response.output);
                } catch (error) {
                    console.error('Error while searching:', error);
                    const messagebox = this.#chatView.querySelector('.message-box');
                    const searchError = this.#chatView.createElement('div');
                    searchError.textContent = 'Er is iets fout gegaan tijdens het opzoeken! Meld dit bij een medewerker' +
                        ' of probeer het later nog een keer.';
                    messagebox.appendChild(searchError);
                }
            } else {
                messageBox.removeChild(loadingMessage);
                this.#createMessage(this.#response.output);
            }

            // scroll to the bottom to show the latest message
            messageBox.scrollTop = messageBox.scrollHeight;

        } catch (error) {
            console.error('Geen response vanuit de front-end', error);
            messageBox.removeChild(loadingMessage);
            const errorMessage = document.createElement("div");
            errorMessage.classList.add("bot-message", "error-message");
            errorMessage.textContent = "Oops! OBI heeft technische problemen! Meld dit bij een medewerker.";
            messageBox.appendChild(errorMessage);
        }
    }

    /**
     * display results needs this to parse the oba api response
     * @author Armando Labega
     * @param xmlString
     * @returns {Document}
     */
    parseXmlString(xmlString) {
        const parser = new DOMParser();
        return parser.parseFromString(xmlString, "application/xml");
    }

    /**
     * displays results of oba api search
     * @author Yusuf Çalik
     * @param xmlString
     */
    displayResults(xmlString) {
        // Parse the XML string
        const xmlDoc = this.parseXmlString(xmlString);

        // Extract the results
        const results = xmlDoc.getElementsByTagName("result");

        const messagebox = document.querySelector('.message-box');

        if (results.length === 0) {
            const noResultsElement = document.createElement('div');
            noResultsElement.classList.add("error")
            noResultsElement.textContent = 'Geen resultaten gevonden voor uw zoekopdracht. Uw boek bestaat niet of u heeft een typfout gemaakt!';
            messagebox.appendChild(noResultsElement);
        } else {
            // Process and display results
            const result = results[0];

            // Extract the title, thumbnail and link from the XML
            const titleElement = result.getElementsByTagName("title")[0];
            const title = titleElement.textContent;

            const coverImageElement = result.getElementsByTagName("coverimage")[0];
            let coverImageUrl = coverImageElement.textContent;
            coverImageUrl = coverImageUrl.replaceAll("&amp;", "&");

            const urlElement = result.getElementsByTagName("detail-page")[0];
            const urlBook = urlElement.textContent;

            // Create a div element to hold the result
            const resultElement = document.createElement('div');

            const linkElement = document.createElement('a');
            linkElement.href = urlBook;
            linkElement.target = '_blank'; // Open the link in a new tab

            // Create an img element, set the thumbnail URL as its src, and append it to the result element
            const thumbnail = document.createElement('img');
            thumbnail.src = coverImageUrl;
            linkElement.appendChild(thumbnail);

            resultElement.appendChild(linkElement);

            // Create a title element, set the title as its content, and append it to the result element
            const titleElementDisplay = document.createElement('div');
            titleElementDisplay.textContent = title;
            resultElement.appendChild(titleElementDisplay);

            const urlElementDisplay = document.createElement('a');
            urlElementDisplay.textContent = "Klik hier voor meer informatie over het boek";
            urlElementDisplay.href = urlBook;
            urlElementDisplay.target = "_blank";
            resultElement.appendChild(urlElementDisplay);

            // Append the result element to the results container
            messagebox.appendChild(resultElement);

        }
    }


    /**
     * @author Ryan-Jay Takkenberg & Yusuf Çalik
     * @param text
     */
    #createMessage(text) {
        const messageBox = this.#chatView.querySelector(".message-box");
        const botMessage = document.createElement("div");
        botMessage.classList.add("bot-message");
        botMessage.innerHTML = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

        /**
         * Author Yusuf Çalik
         * @type {HTMLDivElement}
         * Hiermee maak ik een Text-To-Speech object aan en stel ik het zo in-
         * dat hij praat als er op de play button wordt gedrukt en gestopt
         * als je op de stop button drukt.
         */
        const audioContainer = document.createElement("div");
        audioContainer.classList.add("audio-container");

        const playButton = document.createElement("button");
        playButton.classList.add("audio-button");
        const playIcon = document.createElement("i");
        playIcon.classList.add("fas", "fa-play");
        playButton.appendChild(playIcon);

        const stopButton = document.createElement("button");
        stopButton.classList.add("audio-button");
        const stopIcon = document.createElement("i");
        stopIcon.classList.add("fas", "fa-stop");
        stopButton.appendChild(stopIcon);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "nl-NL";

        const handlePlayClick = () => {
            speechSynthesis.speak(utterance);
        };

        const handleStopClick = () => {
            speechSynthesis.cancel();
        };

        playButton.addEventListener("click", handlePlayClick);
        stopButton.addEventListener("click", handleStopClick);

        audioContainer.appendChild(playButton);
        audioContainer.appendChild(stopButton);

        messageBox.appendChild(botMessage);
        botMessage.appendChild(audioContainer);
    }

    #buttonLoop(e) {
        const button = e.target;
        if (button.tagName === "BUTTON") {
            const question = button.textContent;
            const input = document.querySelector("#user-input");
            input.value = question;

            // Select the submit button element and add an event listener to it
            const submitButton = document.querySelector("#submit-button");
            // Automatically click the submit button
            submitButton.click();
        }
    }


    /**
     *  Methode for the history of the questions
     *  @author Ryan-Jay Takkenberg
     */
    async #showHistorie() {
        try {
            const isLoggedIn = await this.checkUserLoggedIn(); // Controleer of de gebruiker is ingelogd

            const questions = await this.#chatRepository.getQuestion(this.#userSession);
            const questionList = document.createElement("div");
            questionList.classList.add("questions");

            if (!isLoggedIn) {
                const loginMessage = document.createElement("div");
                loginMessage.textContent = "Maak een account aan om uw geschiedenis op te slaan!";
                loginMessage.classList.add("login-message");
                questionList.appendChild(loginMessage);
            } else {
                questions.forEach((question) => {
                    const questionContainer = document.createElement("div");
                    questionContainer.classList.add("question-container");

                    const questionItem = document.createElement("button");
                    questionItem.classList.add("message");
                    questionItem.textContent = question.question;

                    const deleteButton = document.createElement("span");
                    deleteButton.classList.add("delete-historie");
                    const icon = document.createElement("i");
                    icon.classList.add("fas", "fa-trash");
                    deleteButton.appendChild(icon);

                    questionItem.appendChild(deleteButton);
                    questionContainer.appendChild(questionItem);
                    questionList.appendChild(questionContainer);

                    deleteButton.addEventListener("click", async () => {
                        try {
                            const questionText = questionItem.textContent;
                            await this.#chatRepository.deleteHistorie(questionText);
                        } catch (error) {
                            console.error("Error occurred while deleting the question: ", error);
                        }
                    });
                });
            }

            const messageBox = this.#chatView.querySelector(".historie-box");
            messageBox.innerHTML = "";
            messageBox.appendChild(questionList);
        } catch (error) {
            console.error("Error occurred while fetching history questions: ", error);
        }
    }

    /**
     *  Method to check if user is logged in
     *  @author Yusuf Çalik
     */
    async checkUserLoggedIn() {
        // Check if there is a user session
        this.#userSession = App.sessionManager.get("userId");
        return !!this.#userSession; // Return true if there is a user session, else false
    }

    /**
     *  Methode for saving the questions
     *  @author Ryan-Jay Takkenberg & Yusuf Çalik
     */
    async #saveQuestions(e) {
        e.preventDefault();

        // Check if the user is logged in
        const isLoggedIn = await this.checkUserLoggedIn();

        //if user is logged in do this
        if (isLoggedIn) {
            const shouldSave = await this.showConfirmationPopup("Wil je de eerste vraag en het antwoord opslaan?");

            if (shouldSave) {

                // save the question and response to the ChatRepository
                const responseText = this.#response.output || this.#response.results[0].answer;

                await this.#chatRepository.postQuestion(
                    this.#userMessage.textContent,
                    responseText,
                    this.#userSession
                );

                // refresh the history
                const updatedQuestions = await this.#chatRepository.getQuestion(this.#userSession);
                await this.#showHistorie(updatedQuestions);
            }
        }

        //clear the messagebox
        const messageBox = this.#chatView.querySelector(".message-box");
        while (messageBox.firstChild) {
            messageBox.removeChild(messageBox.firstChild);
        }
    }

    /**
     *  Methode for saving the questions pop-up
     *  @author Yusuf Çalik
     */
    async showConfirmationPopup(message) {
        return new Promise((resolve) => {
            const isLoggedIn = this.checkUserLoggedIn(); // Een methode om te controleren of de gebruiker is ingelogd

            // Controleer of de gebruiker is ingelogd voordat de pop-up wordt weergegeven
            if (!isLoggedIn) {
                resolve(false);
                return;
            }

            // Maak een overlay-element
            const overlay = document.createElement("div");
            overlay.className = "overlay";

            const popup = document.createElement("div");
            popup.className = "popup";

            const popupContent = document.createElement("div");
            popupContent.className = "popup-content";

            const messageParagraph = document.createElement("p");
            messageParagraph.textContent = message;

            const confirmButton = document.createElement("button");
            confirmButton.className = "popup-button confirm";
            confirmButton.textContent = "Ja";

            const cancelButton = document.createElement("button");
            cancelButton.className = "popup-button cancel";
            cancelButton.textContent = "Nee";

            confirmButton.addEventListener("click", () => {
                document.body.removeChild(overlay);
                resolve(true);
            });

            cancelButton.addEventListener("click", () => {
                document.body.removeChild(overlay);
                resolve(false);
            });

            popupContent.appendChild(messageParagraph);
            popupContent.appendChild(confirmButton);
            popupContent.appendChild(cancelButton);
            popup.appendChild(popupContent);

            overlay.appendChild(popup);
            document.body.appendChild(overlay);
        });
    }

}
