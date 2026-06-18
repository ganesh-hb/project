export class Filter {
    async makeFilterString(param, alias) {
       try {
      let filterString: any = '';

      if (Array.isArray(param)) {
        for (let i = 0; i < param.length; i++) {
          let key = "";
          let operator = "";
          let value = "";

          for (let j in param[i]) {
            if (j == "key") {
              key = param[i][j];
            }
            if (j == "operator") {
              operator = param[i][j];
            }
            if (j == "value") {
              value = param[i][j];
            }
          }

          let condition = await this.filterCondition(
            key,
            operator,
            value,
            alias
          );

          if (filterString != '') {
            filterString += ' AND ' + condition;
          } else {
            filterString = condition;
          }
        }
      } else {
        let key = "";
        let operator = "";
        let value = "";

        for (let i in param) {
          if (i == "key") {
            key = param[i];
          }
          if (i == "operator") {
            operator = param[i];
          }
          if (i == "value") {
            value = param[i];
          }
        }

        filterString = await this.filterCondition(
          key,
          operator,
          value,
          alias
        );
      }

      return filterString;
    } catch (err) {
      console.log(err);
    }
  }

    async filterCondition(key,operator,value ,alias) {
        try {
            let whereStr = ""
            let symbol = "";
            switch (operator) {
                case "equal":
                symbol='=';
                whereStr += ' ' +`${alias + '.' + key} ${symbol}  "${value}"`
                break;

                case "greaterThan":
                    symbol = '>'
                    whereStr += ' ' +`${alias + '.' + key} ${symbol}  "${value}"`
                break;

                case "smallerThan":
                    symbol = '>'
                    whereStr += ' ' +`${alias + '.' + key} ${symbol}  "${value}"`
                break;

                case "begin":
                    symbol = 'LIKE'
                    whereStr += ' ' + `${alias}.${key} ${symbol} "${value}%"`
                break;

                case "contains":
                    symbol = 'LIKE'
                    whereStr += ' ' + `${alias}.${key} ${symbol} "%${value}%"`
                break;

                case "end":
                    symbol = 'LIKE'
                    whereStr += ' ' + `${alias}.${key} ${symbol} "%${value}"`
                break;

            }
            return whereStr;
        
        } catch (err) {
            return err;
        }
    }


    async calcPages(param?, userEntity?){
        try{
         let [val,cnt] = await userEntity.findAndCount()
         //console.log(cnt)
            let page = param.page ? parseInt(param.page) : 1;
            let limit = param.limit ? parseInt(param.limit) : 10;
            let skip = 0;
            if(cnt<(page - 1) * limit){
                skip=cnt-limit-1;
            }else{
                skip = (page - 1) * limit;
            }
            if(param.page<=0){
                skip=0;
            }
            //console.log(skip,limit)
            return [skip,limit]
    }catch(err){
        return err;
    }
    }

}