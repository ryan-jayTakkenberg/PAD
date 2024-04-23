/**
 * Responsible for communicating with OBA API
 *
 * @author Armando Labega
 */

import {Controller} from "./controller.js";
import {NetworkManager} from "../framework/utils/networkManager.js";
import {ObaApiRepository} from "../repositories/obaApiRepository.js";

export class BooksController extends Controller {
    #booksView
    #networkManager
    #obaApiRepository;

    constructor() {
        super();
        this.#networkManager = new NetworkManager();
        this.#obaApiRepository = new ObaApiRepository();
        this.#setupView()
    }

    /**
     * Loads contents of desired HTML file into the index.html .main div
     * @returns {Promise<void>}
     * @private
     * @author Armando Labega
     */
    async #setupView() {
        //await for when HTML is loaded
        this.#booksView = await super.loadHtmlIntoContent("html_views/books.html")

        this.#booksView.querySelector('.input-box').addEventListener('click', () => this.#handleBookKeyword());
        this.#booksView.querySelector('.input-box input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                // Call the handleBookKeyword function when Enter key is pressed
                this.#handleBookKeyword();
            }});
    }

    /**
     * This just does a check if the message box is too long or not, if it is too long it will show the scrollbar,
     * if not then it will just hide it
     * @param messageBoxBook - Here you input the message box you want to use.
     * @private
     * @author Armando Labega
     */
    #checkScrollbar(messageBoxBook) {
        // Check if the content height exceeds the box height
        if (messageBoxBook.scrollHeight <= messageBoxBook.clientHeight) {
            // If content height is smaller or equal, hide the scrollbar
            messageBoxBook.style.overflowY = 'hidden';
        } else {
            // If content height is larger, show the scrollbar
            messageBoxBook.style.overflowY = 'scroll';
        }
    }

    clearInputField() {
        const inputField = this.#booksView.querySelector('#inputOfUser');
        inputField.value = '';
    }

    /**
     * This code handles the book search. It retrieves the input of the user and sends it to the oba api repository and
     * gets a result back. The result is xml, so I first have to parse it. Then I only select the elements that I want
     * to see on the page and I display it in the message box.
     * @returns {Promise<void>}
     * @private
     * @author Armando Labega
     */
    async #handleBookKeyword() {
        const keyword = this.#booksView.querySelector('#inputOfUser').value;
        this.clearInputField();
        if (keyword) {
            try {
                const xmlString = await this.#obaApiRepository.searchOba(keyword);

                // Parse the XML string
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlString, "application/xml");

                // Extract the results
                const results = xmlDoc.getElementsByTagName("result");

                const messageBoxBook = document.querySelector('.message-box-forBook');

                // Clear previous results
                messageBoxBook.innerHTML = '';

                if (results.length === 0) {
                    const noResultsElement = document.createElement('div');
                    noResultsElement.textContent = 'No results found for your query';
                    messageBoxBook.appendChild(noResultsElement);
                } else {
                    console.log(xmlDoc)
                    // Process and display results
                    for (let i = 0; i < results.length; i++) {
                        const result = results[i];

                        // Extract the title and thumbnail from the XML
                        const titleElement = result.getElementsByTagName("title")[0];
                        const title = titleElement.textContent;

                        const coverImageElement = result.getElementsByTagName("coverimage")[0];
                        let coverImageUrl = coverImageElement.textContent;
                        coverImageUrl = coverImageUrl.replaceAll("&amp;", "&");

                        const urlElement = result.getElementsByTagName("detail-page")[0];
                        const urlBook = urlElement.textContent;

                        // Create a div element to hold the result
                        const resultElement = document.createElement('div');
                        resultElement.classList.add('result-element');

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
                        messageBoxBook.appendChild(resultElement);
                    }
                }
                this.#checkScrollbar(messageBoxBook)
            } catch (error) {
                console.error('Error while searching:', error);
                // Handle error (e.g., display an error message)
            }
        }
    }
}