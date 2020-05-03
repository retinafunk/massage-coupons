import {Component, Host, h, State, Prop} from '@stencil/core';
//import uniqid from 'uniqid';
import uniqid from '../../unique-id';
import jsPDF from 'jspdf';
// @ts-ignore
import {Form} from '../form/form';
/*import 'https://unpkg.com/ionicons@4.5.10-0/dist/ionicons.js';*/

@Component({
  tag: 'coupons-shop',
  styleUrl: 'shop.css',
  shadow: false
})
export class Shop {

  @Prop() targetURL='https://www.mobile-massagen-duesseldorf.de/process-order/';

  @State() totalPrice = 0;
  @State() coupons = [];
  @State() currentPrice = 25;
  @State() currentAmount = 1;
  @State() isCheckout = false;
  @State() isPayed = false;
  @State() isSendAsLetter = false;
  //@State() isPayed = true;
  @State() currentMessage= '';
  #currentCompany= '';

  formData=[];

  addCoupons(evt: MouseEvent) {
    evt.preventDefault();
    //console.log('addCoupons()');
    for (let i = 0; i < this.currentAmount; i++) {
      let coupon = {
        id: uniqid(),
        price: this.currentPrice,
        message: this.currentMessage
      };
      this.coupons = [...this.coupons, coupon];
    }

    this.calculateTotalPrice();
  }

  deleteCoupon(evt: MouseEvent, id: string) {
    evt.preventDefault();
    //console.log('deleteCoupon', id);
    let tmp = this.coupons.filter(coupon => coupon.id !== id);
    this.coupons = [...tmp];
    this.calculateTotalPrice();
  }

  calculateTotalPrice() {
    this.totalPrice = this.coupons.reduce((total, current, index, array) => {
      let i = index;
      console.log(i);
      let shippingCosts = 0;
      if(this.isSendAsLetter) shippingCosts += 1.5;
      if (array.length === 0) return 0;
      return total += (current.price + shippingCosts);
    }, 0);
  }

  renderCouponsPDFs(evt: MouseEvent) {
    evt.preventDefault();
    const doc = new jsPDF();
    let posY = 20;
    let posIncLine = 10;
    let posIncBlock = 20;
    let counter = 0;
    this.coupons.map(coupon => {
      posY = 0;
      if (counter > 0) {
        doc.addPage();
        posY = 0;
      }
      let msg = '';
      if(coupon.message.length>2) msg = coupon.message;
      doc.setFontSize(30)
        .addImage(document.getElementById('coupon-image'),0,posY,210,70)
        .setFontType('bold')
        .setFontSize(18)
        .text(`für eine Massage bei :  ${this.#currentCompany}`, 10, posY + 80 )
        .setFontSize(16)
        .setFontType('bold')
        .text(`Gutscheinwert : ${coupon.price}€`, 10, posY += posIncLine + 80 );
        if(msg.length>1){
        doc.setFontSize(14)
            .setFontType('normal')
            .text(`${msg}`, 10, posY += posIncLine )
        }
        doc.setFontSize(12)
        .text(`Gültigkeit: 1 Jahr`, 10, posY += posIncLine)
        .text(`Code: ${coupon.id}`, 10, posY += posIncLine)
      posY += posIncLine;
/*      doc.setLineDash([3, 2], 0)
        .line(0, posY, 300, posY, 'S');*/

      posY += posIncBlock;
      counter++;
    });
    // doc.save('massage-gutscheine.pdf');
    doc.setProperties({
      title: "Massage Gutscheine - selber drucken!"
    });
    doc.output('dataurlnewwindow');

  }

  checkout() {
    this.isCheckout=true;
    if (!window['paypal']) return;
    this.isCheckout = true;
    const paypal = window['paypal'];
    paypal.Buttons({
      createOrder: (data, actions) => {
        // This function sets up the details of the transaction, including the amount and line item details.
        console.log('createOrder',data);
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: this.totalPrice
            }
          }]
        });
      },
      onApprove: (data, actions) => {
        // This function captures the funds from the transaction.
        return actions.order.capture().then((details) => {
          // This function shows a transaction success message to your buyer.
          this.isPayed = true;
          this.sendOrderEmails();
          console.log('isPayed',this.isPayed,this);
          console.log('Transaction completed by ' + details.payer.name.given_name + ' ' + data);
        });
      }
    }).render('#paypal-container');
  }

  onFormSubmitted(payload:any){
    console.log('shop onFormSubmitted() payload : ',payload);
    this.formData=[...payload];
    this.#currentCompany = this.formData[0]['value'];
    this.checkout();
  }

  sendOrderEmails(){
    console.log('sendOrderEmails()');
    this.formData=[...this.formData,...this.coupons];
    fetch(this.targetURL,{
      method: 'post',
      mode: 'no-cors',
      body: JSON.stringify(this.formData)
    }).then(response=>{
      if(response.ok) {
        return response.json();
      }
    }).then(json=>{
      console.log('json was sent',json);
      let emailIsSent = json.emailWasSent === 1;
      if(emailIsSent){
        console.log('Form emails were sent successfully.');
      } else{
        // as the server is delay  the sending of emails reset form and give feedback anyway
        console.warn('We could not send the form emails!.');
      }
    })
      .catch(err=>console.error(err));
  }
  updatePersonalizedMessage(target,id:string){
    console.log('updatePersonalizedMessage',id,target.value);
    this.coupons.forEach((coupon,index)=>{
       if(coupon.id===id){
         this.coupons[index].message=target.value;
       }
       this.coupons = [...this.coupons];
    });
  }
  updateCurrentPersonalizedMessage(value:string){

    this.currentMessage = value;
    console.log('updateCurrentPersonalizedMessage',this.currentMessage);
  }
  sendAsletter(checked){
    console.log('App - sendAsletter() ',checked);
    this.isSendAsLetter = checked;
    this.calculateTotalPrice();
    console.log('App -   this.totalPrice ',  this.totalPrice);

  }
  render() {
    return (
      <Host >
        <link rel="stylesheet" href="https://unpkg.com/balloon-css/balloon.min.css" />
        <div  class='container mx-auto border p-4'>
          <slot name="cta-1"></slot>
          <div class="mt-4"> </div>
          <div class="md:grid  md:grid-cols-3 md:gap-4 w-full">

            {
              !this.isCheckout && !this.isPayed ?
                <div class="col-span-2">
                  <label class={"inline"} htmlFor="price-input"> Anzahl:</label>
                  <input id={"amount-input"}
                         class="inline shadow appearance-none border rounded w-10 md:w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-4 font-bold"
                         type="number" min="1" max="100" value={this.currentAmount}
                         onInput={evt => this.currentAmount = parseInt(evt.target['value'])}/>
                  <label class={"inline"} htmlFor="price-input"> Wert: </label>
                  <input id={"price-input"}
                         class="inline shadow appearance-none border rounded w-16  md:w-20 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-4 font-bold"
                         type="number" value={this.currentPrice}
                         onInput={evt => this.currentPrice = parseInt(evt.target['value'])}/> €
                  <input type="text" name="personalized-message" placeholder="personlicher Gutscheintext (optional)" class="inline shadow appearance-none border rounded w-1/2 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline md:mx-4 mt-2 w-full md:w-1/2 " style={{width:'25 0px'}} onBlur={evt=>{this.updateCurrentPersonalizedMessage(evt.target['value'])}}  />
                  <button aria-label="Gutscheine erzeugen!" data-balloon-pos="down"
                    class="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline my-2"
                    onClick={(evt) => this.addCoupons(evt)}>{this.currentAmount} {this.currentAmount > 1 ? 'Gutscheine' : 'Gutschein'} in
                    Wert von {this.currentPrice}€ Zum Warenkorb hinzufügen.
                  </button>
                </div>
                : <div> </div>
            }
            <img id="coupon-image" class="w-full h-32" src="https://www.mobile-massagen-duesseldorf.de/site/templates/images/coupon-image.jpg" alt=""/>
          </div>



          <div class={'shopping-cart p-4 flex flex-wrap'}>
            <div> <ion-icon name="cart" size="large"> </ion-icon> </div>
            {!this.isCheckout && !this.isPayed ? this.coupons.map(coupon =>
              <div class={"coupon-item relative  border p-2 mr-2 rounded mb-2 w-full md:flex items-center justify-between whitespace-no-wrap"} key={coupon.id}>Gutschein:&nbsp; <strong>{'' + coupon.price + '€'}</strong>
                <input type="text" name="personalized" placeholder="personlicher Gutscheintext (optional)" class="block md:inline shadow appearance-none border rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline md:mx-4 mt-4 md:mt-auto  " style={{width:'25 0px'}} onBlur={evt=>{this.updatePersonalizedMessage(evt.target,coupon.id)}} value={coupon.message.length>1 ? coupon.message : this.currentMessage} />
                <button class="border rounded p-1 ml-2 rounded-b absolute right-0 top-0 m-2 md:m-auto md:static" onClick={evt => this.deleteCoupon(evt, coupon.id)} disabled={this.isPayed} >
                  <ion-icon name="trash" aria-label="Gutschein löschen!" data-balloon-pos="up"> </ion-icon>
                </button>
              </div>
            ) : <div> </div>}
          </div>
          <div class="text-xl ml-4">
            Anzahl Gutscheine: <strong>{this.coupons.length}</strong>
          </div>
          <div class="text-xl  ml-4">
            Preis insgesamt : <strong>{this.totalPrice} €</strong>
          </div>



          {
            this.totalPrice>10 && !this.isCheckout  ?
              <shipping-form onsubmitted={(data)=>this.onFormSubmitted(data)} onsendasletter={(checked)=>this.sendAsletter(checked)}> </shipping-form>
              :
              <div> </div>
          }
          {this.isPayed && !this.isSendAsLetter ? <div> <p> <br/> <strong>Juhuu – Der Bestellvorgang Ihres Massage Wertgutscheins war erfolgreich!</strong><br/> Vielen Dank für Ihre Bestellung und viel Spaß beim Verschenken! <br/><br/>
            Ihr Sarula Massage Team<br/> <br/>
          </p> <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={evt => this.renderCouponsPDFs(evt)}>PDFs erzeugen!</button> </div> : <div></div>}
        </div>
        {
          !this.isPayed  ?
          <div><div id="paypal-container"></div></div> : <div> </div>
        }
{/*        <script
          src="https://www.paypal.com/sdk/js?client-id=AShRziXldx8KxLgWXyP7WkNWWD8ctoHZ06x2npBWPPCxSFPZ7tY_EmQmXTPN-Rk9jlD3bgRxXzbmeA7v">
        </script>*/}
        <script
          src="https://www.paypal.com/sdk/js?client-id=Ae0eGEX3LaAYLpBCYLgUC8y-28RcsXqmDzmNW-uVcJnUaM39V3uHxUblsLLdrCJcuCYUK_9H74OKht5f">
        </script>
{/*        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => this.sendOrderEmails()}>Send EMails!</button>*/}
      </Host>
    );
  }

}
