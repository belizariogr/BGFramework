module.exports =  {
    name: 'costumers',
    path: '/costumers',
    list: true,
    record: true,
    insert: true,
    update: true,
    delete: true,

    validateRecord: function(rec){
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
    },

    beforeInsert: async function(rec){

    },

    afterInsert: async function(rec){

    },

    beforeUpdate: async function(rec){

    },

    afterUpdate: async function(rec){

    },

    beforeDelete: async function(rec){

    },

    afterDelete: async function(rec){

    },
}