

Object.defineProperty(Array.prototype, 'getLast', {
    get: function() {
        if (this.length === 0) {
            throw new Error("No elements in array");
        }
        return this[this.length - 1];
    }
});


Object.defineProperty(Array.prototype, 'first', {
    get: function() {
        if (this.length === 0) {
            throw new Error("No elements in array");
        }
        return this[0];
    }
});
