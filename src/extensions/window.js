

Object.defineProperty(Array.prototype, 'getLast', {
    get: function() {
        if (this.length === 0) {
            throw new Error("No elements in array");
        }
        return this[this.length - 1];
    }
});


