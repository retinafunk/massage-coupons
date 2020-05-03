import {Component, Host, h, Element, State, Prop} from '@stencil/core';
import Bouncer from 'formbouncerjs';

@Component({
  tag: 'shipping-form',
  styleUrl: 'form.css',
  shadow: false
})
export class Form {
  @Prop() onsubmitted : Function;
  @Prop() onsendasletter : Function;
  @Element() el:HTMLElement;
  @State() formData=[];

  validator :any ;

  componentDidLoad() {
   // console.log("componentDidLoad()");
      this.validator = new Bouncer('form',{
        messages: {
          missingValue: {
            checkbox: 'Das ist ein Pflichtfeld.',
            radio: 'Please select a value.',
            select: 'Please select a value.',
            'select-multiple': 'Please select at least one value.',
            default: 'Das ist ein Pflichtfeld und darf nicht leer sein.'
          },
          patternMismatch: {
            email: 'Bitte eine gültige Email Adresse eintragen.',
            url: 'Please enter a URL.',
            number: 'Please enter a number',
            color: 'Please match the following format: #rrggbb',
            date: 'Please use the YYYY-MM-DD format',
            time: 'Please use the 24-hour time format. Ex. 23:00',
            month: 'Please use the YYYY-MM format',
            default: 'Please match the requested format.'
          }
        }
      });

    /*    let formElem =   this.el.querySelector('form');
       console.log("formElem ",formElem);

       this.el.querySelector('form').addEventListener('submit',evt=>{
          evt.preventDefault();
          console.log('form submit event 2');
          return false;

         });*/
  }

  submitForm(evt){
    evt.preventDefault();
    let form = this.el.querySelector('form');
    let isValid = this.validator.validateAll(form);
/*    console.log('isValid',isValid);*/
    if(isValid.length===0){
      this.processForm();
    }
    return false;
  }
  processForm(){
    console.log('processForm');
    let formElements =   this.el.querySelector('form').elements;
    console.log('formEllements',typeof formElements,formElements.length,formElements[0]);
    for (const i in formElements){
      // console.log('--------',i,formElements[i]);
      let input = formElements[i];
      if(input['type']==='text' || input['type']==='textarea' || input['type']==='email' || input['type']==='number'){
        this.formData = [...this.formData,{
          name: input['name'],
          value: input['value'],
        }];
      }
    }
    console.log("this.formData",this.formData);
    if(this.onsubmitted!==undefined){
      this.onsubmitted(this.formData);
    }
  }
  sendAsLetter(checked){
    console.log('this.sendAsLetter()',checked);
    this.onsendasletter(checked);
  }

  render() {
    return (
      <Host>
        <div class="pt-4">
          <form id="shipping-form" action="" onSubmit={evt=>this.submitForm(evt)}>
{/*            <div>
              <label><input type="checkbox" id="send-via--post-service" name="agreeAgbs" required /> optional auch per Post senden!  </label>
            </div>*/}
            <label  htmlFor="gutscheineLocation">* In welcher Firma soll die Massage statt finden:</label>
            <input id="gutscheineLocation" name="gutscheineLocation" placeholder="" type="text" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" value=""  />
            <label htmlFor="couponMessage">Nachrichtenfeld für spezielle Wünsche:</label>
            <textarea  name="couponMessage" id="couponMessage" placeholder="Ihre Nachricht..." class="shadow appearance-none border rounded w-full py-2 px-3* text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">    </textarea>
            <label htmlFor="couponEmail">*Email</label>
            <input id="couponEmail" name="couponEmail"  type="email" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" value={""}/>
            <label htmlFor="couponEmailConfirm">*Email bestätigen</label>
            <input id="couponEmailConfirm" name="couponEmailConfirm"  type="email" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" value={""} />
            <h2 class="text-xl">Lieferadresse, Rechnungsadresse:</h2>
            <label htmlFor="shippingCompany">*Firma:</label>
            <input id="shippingCompany" name="shippingCompany"  type="text" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" value={""}/>
            <label htmlFor="surname">*Vorname:</label>
            <input id="surname" name="surname"  type="text" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"  value={""}/>
            <label htmlFor="familyname">*Nachname:</label>
            <input id="familyname" name="familyname"  type="text" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"  value={""}/>
            <label htmlFor="street">*Strasse & Nr:</label>
            <input id="street" name="street"  type="text" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"  value={""}/>
            <label htmlFor="plz">*PLZ:</label>
            <input id="plz" name="plz" type="number" min="1000" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"  value={""}/>
            <label htmlFor="city">*Stadt:</label>
            <input id="city" name="city"  type="text" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"  value={""}/>
            <div>
              <label><input type="checkbox" id="send-as-letter" name="send-as-letter" onClick={evt=>this.sendAsLetter(evt.target['checked'])}  /> optional Gutscheine per Post senden ( zusätzlich 1.5€ Versandkosten) </label>
            </div>
            <div>
              <label><input type="checkbox" id="agree-agbs" name="agreeAgbs" required /> * Ich bin bin mit den <a href="#agbs">AGBs/Rückgabe </a> und Datenschutz einverstanden  </label>
            </div>
            <div class="pt-4" >

              <button
                type="submit" form="shipping-form" value="Submit"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={evt=>this.submitForm(evt)}
                >SENDEN
              </button>
            </div>
            <p class="pt-4">
              <em>
                *Bitte beachten: sämtliche Pflichtfelder sind mit * markiert und müssen ausgefüllt werden, um ein Formular absenden zu können!
              </em>
            </p>
          </form>
        </div>
      </Host>
    );
  }

}
