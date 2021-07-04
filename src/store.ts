import {action, makeObservable, observable} from 'mobx';

interface StoreType{
    data:any,
    actionData:any,
    timeStart:number,
    actionTimeStart:any
}

class Store implements StoreType{
    constructor() {
        makeObservable(this, {
            data: observable,
            actionData: action,
            timeStart: observable,
            actionTimeStart: action
        });
    }

    data = []

    actionData(message:any){
        this.data = this.data.concat(message)
    }

    timeStart = 0

    actionTimeStart(){
        this.timeStart = new Date().getTime();
    }
}

export default new Store();