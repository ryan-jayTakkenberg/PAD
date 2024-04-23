/**
 * route voor de question and answers
 * @author Ryan Takkenberg
 */

import { Controller } from "./Controller.js";
import { concertRepository } from "../repositories/concertRepository.js";

export class concertController extends Controller {
    #chatView;
    #concertRepository;

    constructor() {
        super();
        this.#concertRepository = new concertRepository();
        this.#klik();
    }

   async #klik(){
        this.#chatView.querySelector("#submit-button").addEventListener("click", event => this.#vraagOpslaan(event));

    }

    #vraagOpslaan (event){
        event.preventDefault();
        console.log("hallo")


        // get the input from the search bar (input text field)
        const question = this.#chatView.querySelector("#user-input").value;



    }
}