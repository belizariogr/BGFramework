module.exports.route = function() {

    // This file has all implementations of the actions to be used as an example, however, it's not necessary to implement that way. See products file for a simple example.

    var validateCostumer = function(rec) {
        // Errors Code 0 and 1 are systems erros. Please, use 2 or more.
        if (!rec.Name)
            error(1, "Field \"Name\" is required.");
        if (!rec.Address)
            error(2, "Field \"Address\" is required.");
        if (!rec.PhoneNumber)
            error(3, "Field \"Phone Number\" is required.");
        if (!rec.Email)
            error(4, "Field \"Email\" is required.");
        if (!!rec.Gender && rec.Gender != 'M' && rec.Gender != 'F')
            error(5, "Invalid gender.")
    };

    return {
        name: 'costumers',
        path: '/costumers',

        list: function(req, res) {
            getList(__dirname).get(req, res);
        },

        record: function(req, res) {
            getRecord(__dirname).get(req, res);
        },

        insert: function(req, res) {
            var before = function(rec, callback) {
                validateCostumer(rec);
                callback();
            };
            var after = function(rec, callback) {
                callback();
            };
            getRecord(__dirname).insert(req, res, before, after);
        },

        update: function(req, res) {
            var before = function(rec, callback) {
                validateCostumer(rec);
                callback();
            };
            var after = function(rec, callback) {
                callback();
            };
            getRecord(__dirname).update(req, res, before, after);
        },

        delete: function(req, res) {
            var before = function(rec, callback) {
                callback();
            };
            var after = function(rec, callback) {
                callback();
            };
            getRecord(__dirname).delete(req, res, before, after);
        },
    }
}