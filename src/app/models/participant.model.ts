export class Participant {
  constructor(
    public id: string,
    public wspolnota: string,
    public imieINazwisko: string,

    public obecnosc?: string,
    public kwatera?: string,
    public prezbiter?: string,
    public malzenstwo?: string,
    public kobieta?: string,
    public mezczyzna?: string,
    public bobas?: string,
    public dziecko?: string,
    public p?: string,
    public nianiaOddzielnie?: string,
    public uwagi?: string,
    public wiek?: string,
    public srodekTransportu?: string,
    ) {}
}