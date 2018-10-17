"use strict";

class CostumersController extends Controller {

    constructor() {
        super('costumers' ,'/costumers');
        this.list = true;
        this.record = true;
        this.insert = true;
        this.update = true;
        this.delete = true;
    }

    validateRecord(rec) {
        /* All properties of rec will be in lower case. */
        if (!rec.name)
            error(1, "Field \"Name\" is required.");
        if (!rec.address)
            error(2, "Field \"Address\" is required.");
        if (!rec.phonenumber)
            error(3, "Field \"Phone Number\" is required.");
        if (!rec.email)
            error(4, "Field \"Email\" is required.");
        if (!!rec.gender && rec.gender != 'M' && rec.gender != 'F')
            error(5, "Invalid gender.")
    }

    async beforeInsert(rec) {

    }

    async afterInsert(rec) {

    }

    async beforeUpdate(rec) {

    }

    async afterUpdate(rec) {

    }

    async beforeDelete(rec) {

    }

    async afterDelete(rec) {

    }

}

module.exports = CostumersController;