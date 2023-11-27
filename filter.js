import { LightningElement,wire,api,track } from 'lwc';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import PRODUCT_OBJECT from '@salesforce/schema/Product2'
import FAMILY_FIELD from '@salesforce/schema/Product2.Family';

import { publish, MessageContext } from 'lightning/messageService';
import PROD_FILTER_MESSAGE from '@salesforce/messageChannel/ProdFiltered__c'

const FAMILY_ERROR = 'ERROR LOADING FAMILIES'
export default class Clinicfilter extends LightningElement {

    filters={   
        searchKey:'',
        families: []
    };

    @api families;
    @track filters = { families: [] };

    selectedFamily = '';
    familyVisibility = {};


    FamilyError= FAMILY_ERROR

    //load context for LMS

    @wire(MessageContext)
    messageContext

    @wire(getObjectInfo,{objectApiName:PRODUCT_OBJECT})
    productObjectInfo

    @wire(getPicklistValues, {
    recordTypeId:'$productObjectInfo.data.defaultRecordTypeId',
    fieldApiName:FAMILY_FIELD
    })families;

    connectedCallback() {
        if (this.families.data) {
            this.filters = { ...this.filters, families: this.families.data.values.map(item => item.value) };
        }
    }

    handleSearchKeyChange(event){
        console.log(event.target.value)
        this.filters = {...this.filters, "searchKey":event.target.value} 
        this.sendDataToProdList();
    }


    // handleCheckbox(event){
    //     if(!this.filters.families){
    //         const families = this.families.data.values.map(item=>item.value)
    //         this.filters = {...this.filters, families}
    //     }
    //     const {name, value} = event.target.dataset
    //     // console.log("name", name)
    //     // console.log("value", value)
    //     if(event.target.checked){
    //         if(!this.filters[name].includes(value)){
    //             this.filters[name] = [...this.filters[name], value]
    //         }
    //     } else {
    //         this.filters[name] =  this.filters[name].filter(item=>item !==value)
    //     }
    //     this.sendDataToProdList();
    // }


    // handleButtonClick(event) {
    //     const { name, value } = event.target.dataset;

    //     if (this.isFamilySelected(value)) {
    //         this.filters[name] = this.filters[name].filter(item => item !== value);
    //     } else {
    //         this.filters[name] = [...this.filters[name], value];
    //     }

    //     this.sendDataToProdList();
    // }

    // isFamilySelected(value) {
    //     return this.filters.families.includes(value);
    // }



    handleButtonClick(event) {
        const { value } = event.target.dataset;
    
        // Toggle the visibility of the clicked family
        this.familyVisibility = {
            ...this.familyVisibility,
            [value]: !this.familyVisibility[value]
        };
    
        // Update the rendering based on the family visibility
        this.sendDataToProdList();
    }
    
    // isFamilySelected(value) {
    //     // Check if the family is the selected family
    //     return this.selectedFamily === value;
    // }

    sendDataToProdList(){
        window.clearTimeout(this.timer)
        this.timer = window.setTimeout(()=>{
            const visibleFamilies = Object.keys(this.familyVisibility).filter(family => this.familyVisibility[family]);
    const filteredRecords = this.allRecords.filter(record => visibleFamilies.includes(record.family));
            publish(this.messageContext, PROD_FILTER_MESSAGE, {
                filters:this.filters
            })
        }, 400)
        
    }
}
