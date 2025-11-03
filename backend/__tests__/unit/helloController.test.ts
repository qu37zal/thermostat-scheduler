import { HelloController } from '../../backend/src/controllers/helloController';

describe('HelloController', () => {
  let controller: HelloController;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    controller = new HelloController();
    mockReq = {};
    mockRes = {
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('getHello', () => {
    it('should send "Hello World"', () => {
      controller.getHello(mockReq, mockRes);
      expect(mockRes.send).toHaveBeenCalledWith('Hello World');
    });

    it('should call send exactly once', () => {
      controller.getHello(mockReq, mockRes);
      expect(mockRes.send).toHaveBeenCalledTimes(1);
    });
  });
});
