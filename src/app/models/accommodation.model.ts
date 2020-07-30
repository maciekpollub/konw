export class Accommodation {
  constructor(
    public id: string,
    public kwatera: string,
    public tapczan1Osobowy: string,
    public dostawka: string,
    public numerLozka: string,
    public przydzial?: string,
    public imieINazwisko?: string,
    public iloscZakwaterowanych?: string,
    public wolneLozka?: string,
    public wspolnota?: string,
    public prezbiter?: string,
    public malzenstwo?: string,
    public malzenstwoZDziecmiLubCiaza?: string,
    public kobietaClassic?: string,
    public mezczyznaClassic?: string,
    public choroba?: string,
    public nianiaOddzielna?: string,
    public wolnePrzezNoc1?: string,
    public wolnePrzezNoc2?: string,
    public wolnePrzezNoc3?: string,) {}
  
}
