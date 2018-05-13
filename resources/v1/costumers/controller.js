module.exports = function(){
    const validateCostumer = function(rec) {        
        // Errors Code 0 and 1 are systems erros. Please, use 2 or more.
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
    };
    const model = getModel(__dirname);
    return {
        name: 'costumers',
        path: '/costumers',

        list: function(req, res) {             
            model.get(req, res);
        },

        record: function(req, res) {
            model.get(req, res);
        },

        insert: function(req, res) {            
            var before = function(rec) {
                validateCostumer(rec);                
            };
            var after = function(rec) {
                
            };
            model.insert(req, res, before, after);
        },

        update: function(req, res) {
            var before = function(rec) {
                validateCostumer(rec);                
            };
            var after = function(rec) {

            };
            model.update(req, res, before, after);
        },

        delete: function(req, res) {
            var before = function(rec) {
               
            };
            var after = function(rec) {
            };
            model.delete(req, res, before, after);
        },
    }
}();