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

  formData=[];

  addCoupons(evt: MouseEvent) {
    evt.preventDefault();
    //console.log('addCoupons()');
    for (let i = 0; i < this.currentAmount; i++) {
      let coupon = {
        id: uniqid(),
        price: this.currentPrice,
        message: ''
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
      if (array.length === 0) return 0;
      return total += current.price;
    }, 0);
  }

  renderCouponsPDFs(evt: MouseEvent) {
    evt.preventDefault();
    const doc = new jsPDF();
    let posY = 20;
    let posIncLine = 18;
    let posIncBlock = 20;
    let counter = 0;
    this.coupons.map(coupon => {
      if (counter % 4 === 0 && counter > 0) {
        doc.addPage();
        posY = 20;
      }
      doc.setFontSize(30)
        .setFontType('bold')
        .text(`Gutschein`, 10, posY)
        .setFontSize(20)
        .setFontType('normal')
        .text(`für eine mobile Massage in Wert von : ${coupon.price}€`, 10, posY += posIncLine)
        .setFontSize(12)
        .text(`Gutschein Code: ${coupon.message}`, 10, posY += posIncLine)
      posY += posIncLine;
      doc.setLineDash([3, 2], 0)
        .line(0, posY, 300, posY, 'S');
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
  render() {
    return (
      <Host >

        <div class='container mx-auto border p-4'>
          <slot name="cta-1"></slot>
          <div class="mt-4"> </div>
          {
            !this.isCheckout && !this.isPayed ?
              <div>
                <label class={"inline"} htmlFor="price-input"> Anzahl:</label>
                <input id={"amount-input"}
                       class="inline shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-4"
                       type="number" min="1" max="100" value={this.currentAmount}
                       onInput={evt => this.currentAmount = parseInt(evt.target['value'])}/>
                <label class={"inline"} htmlFor="price-input"> Wert: </label>
                <input id={"price-input"}
                       class="inline shadow appearance-none border rounded w-20 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-4"
                       type="number" value={this.currentPrice}
                       onInput={evt => this.currentPrice = parseInt(evt.target['value'])}/> €
                <button
                  class="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
                  onClick={(evt) => this.addCoupons(evt)}>{this.currentAmount} {this.currentAmount > 1 ? 'Gutscheine' : 'Gutschein'} in
                  Wert von {this.currentPrice}€ Zum Warenkorb hinzufügen.
                </button>
              </div>
              : <div> </div>
          }
          <div class={'shopping-cart p-4 flex flex-wrap'}>
            {this.coupons.map(coupon =>
              <div class={"coupon-item  border p-2 mr-2 rounded mb-2 w-full flex items-center justify-between whitespace-no-wrap"} key={coupon.id}>{'Gutschein: ' + coupon.price + '€'}
                <input type="text" name="personalized" placeholder="personlicher Gutscheintext" class="inline shadow appearance-none border rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mx-4 " style={{width:'25 0px'}} onBlur={evt=>{this.updatePersonalizedMessage(evt.target,coupon.id)}} />
                <button class="border rounded p-1 ml-2 rounded-b" onClick={evt => this.deleteCoupon(evt, coupon.id)} disabled={this.isPayed}>
                  <ion-icon name="trash"> </ion-icon>
                </button>
              </div>
            )}
          </div>
          <div class="text-xl">
            Anzahl Gutscheine: <strong>{this.coupons.length}</strong>
          </div>
          <div class="text-xl">
            Preis insgesamt : <strong>{this.totalPrice} €</strong>
          </div>



          {
            this.totalPrice>10 && !this.isCheckout  ?
              <shipping-form onsubmitted={(data)=>this.onFormSubmitted(data)}></shipping-form>
              :
              <div> </div>
          }
          {this.isPayed ? <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={evt => this.renderCouponsPDFs(evt)}>PDFs erzeugen!</button> : <div></div>}
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
