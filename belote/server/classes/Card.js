
class Card {

    value = 0;
    isTrump = false;
    isWinning = false;
    isPlayed = true;

    constructor(rank, suit) {
        this.rank = rank;
        this.suit = suit;
    }

    setValue(){
        switch(this.rank){
            case '7': this.value = 0; break;
            case '8': this.value = 0; break;
            case '9': this.isTrump ? this.value = 14 : this.value = 0; break;
            case '10': this.value = 10; break;
            case 'J': this.isTrump ? this.value = 20 : this.value = 2; break;
            case 'Q': this.value = 3; break;
            case 'K': this.value = 4; break;
            case 'A': this.value = 11; break;
        }
    }
}