export class Participant {
  constructor(
    public id: string | number,
    public wspolnota: string,
    public imieINazwisko: string,

    public obecnosc?: string,
    public kwatera?: string[] | string,
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
    public mazImie?: string,
    public zonaImie?: string,
    public nieobNoc1?: string,
    public nieobNoc2?: string,
    public nieobNoc3?: string,
    ) {}
}