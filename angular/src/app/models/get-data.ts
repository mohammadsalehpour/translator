export class GetData {
  error?: boolean;
  message?: string;
  result?: string;
  data!: any;

    constructor(data?: GetData) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.error = _data["error"];
            this.message = _data["message"];
            this.result = _data["result"];
            this.data = _data["data"];
            if (Array.isArray(_data["data"])) {
                this.data = [] as any;
                for (let item of _data["data"])
                    this.data!.push(item);
            }
        }
    }


  static fromJS(data: any): GetData {
    data = typeof data === 'object' ? data : {};
    let result = new GetData();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data["error"] = this.error
    data["message"] = this.message
    data["result"] = this.result
    data["data"] = this.data
    if (Array.isArray(this.data)) {
      data["data"] = [];
      for (let item of this.data)
        data["data"].push(item.toJSON());
    }
    return data;
  }
}
