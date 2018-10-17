"use strict";

class ProductsController extends Controller {

	constructor() {
		super('products' ,'/products');
        this.list = true;
        this.record = true;
        this.insert = true;
        this.update = true;
        this.delete = true;
    }

    validateRecord(rec) {
		if (!rec.name)
			error(1, "Field \"Name\" is required.");
	}

}

module.exports = ProductsController;