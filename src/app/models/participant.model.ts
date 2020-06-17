export class Participant {
  constructor(
    public no: string,
    public communityName: string,
    public presence: string,
    public participantName: string,
    public allocated: boolean,
    public allocation: string,
    public presbiterQuantity: string,
    public marriageQuantity: string,
    public womanQuantity: string,
    public manQuantity: string,
    public littleChildQuantity: string,
    public olderChildQuantity: string,
    public familyNannyQuantity: string,
    public separateNannyQuantity: string,
    public remarks: string,
    public age: string, 
    public meansOfTransport: string,
    ) {}

}