define([], function(){
    return {
        suits: ["diamond", "clubs", "heart", "spade"],
        types: ["king", "queen", "jack", "ten", "nine", "eight", "seven", "six", "five", "four", "three", "two", "ace"],
        chars: {
            "king": "K", 
            "queen": "Q", 
            "jack": "J", 
            "ten": "10", 
            "nine": "9", 
            "eight": "8", 
            "seven": "7", 
            "six": "6", 
            "five": "5", 
            "four": "4", 
            "three": "3", 
            "two": "2", 
            "ace": "A"
        },
        sectionCounts: {
            "king": 0, 
            "queen": 0, 
            "jack": 0, 
            "ten": 10, 
            "nine": 9, 
            "eight": 8, 
            "seven": 7, 
            "six": 6, 
            "five": 5, 
            "four": 4, 
            "three": 3, 
            "two": 2, 
            "ace": 1
        }
    };
});