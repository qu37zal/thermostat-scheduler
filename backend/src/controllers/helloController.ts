export class HelloController {
    public getHello(req: any, res: any): void {
        res.send("Hello World");
    }
}