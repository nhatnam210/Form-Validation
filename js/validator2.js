function Validator2(formSelector, parentElement, errorElement,toggleClass) {
    var _this=this;
    var formRules = {}

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector))
                return element.parentElement;
            element = element.parentElement    
        }
    }

    /**
     * Quy ước Validate
     * 1 - Nếu sai thì trả ra `message lỗi`
     * 2 - Nếu đúng thì trả ra `undefined`
     */
    //Các hàm định nghĩa quy tắc cho các rules
    var validatorRules = {
        required(value) {
            return value.trim() ? undefined : 'Vui lòng nhập trường này!'
        },
        email(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email!'
        },
        min(min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
            }
        },
        max(max) {
            return function (value) {
                return value.length  <= max ? undefined : `Vui lòng chỉ nhập tối đa ${max} ký tự`
            }
        },
    }

    var formElement = document.querySelector(formSelector);

    //this ở đây đang tương tương chính là Validator2, gióng qua html, đc khởi tạo lưu dô biến "form"
    // console.log(this)

    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]')

        //Lấy ra từng rules của input
        for (var input of inputs) {
            //Tách từng cái rules của từng cái input ra thành chuỗi
            var rulesBySplit = input.getAttribute('rules').split('|')

            for(var rule of rulesBySplit) {
                var ruleInfo;
                var isRuleHasValue = rule.includes(':');

                //Tách tiếp lần 2 nếu có dấu ':'
                if(isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    //Gán đè thằng rule
                    rule = ruleInfo[0]; //min()

                    //Ghi đè lại cho nó mặc định là chạy luôn
                    //Tại hàm trong hàm nên sẽ hơi khó hiểu tí, không sao cả :3
                    //Nó vẫn trả lại hàm bên trong nó, tức là trả ra hợp lí
                    validatorRules[rule] = validatorRules[rule](ruleInfo[1])
                }

                var ruleFunc = validatorRules[rule];

                if(!Array.isArray(formRules[input.name])) {
                    formRules[input.name] = []
                }
                
                //Object có các key lấy theo name, mỗi key tương ứng có value là 1 Array chứa các hàm thực thi của name đó
                formRules[input.name].push(ruleFunc)
            }

            //Lắng nghe sự kiện để validate (blur,input,...)
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        //Hàm thực hiện validate
        function handleValidate(event) { //event của element input
            //Array chứa các hàm thực thi lấy theo name
            var rulesToDo = formRules[event.target.name];
            var errorMessage;

            //Lặp qua để lấy từng hàm để thực thi kiểm tra
            for(var rule of rulesToDo) {
                errorMessage = rule(event.target.value)
                if(errorMessage) break;
            }
        
            //Để cái này cũng được, khi tìm thấy errorMessage thì nó return luôn cái loop này rồi
            //Nên nó sẽ không chạy tiếp để xét thằng sau
            //nhưng cách này hơi dở
        //    rules.some((rule)=> {
        //         errorMessage = rule(event.target.value)
        //         return errorMessage;
        //     });

            if(errorMessage) {
                var formGroup = getParent(event.target, parentElement)
                if(formGroup) {
                    formGroup.classList.add(toggleClass)
                    var formMessage = formGroup.querySelector(errorElement)
                    if(formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
            }

            return !errorMessage;
        }

        //Hàm clear message lỗi
        function handleClearError(event) {
            var formGroup = getParent(event.target, parentElement)
            if(formGroup.classList.contains(toggleClass)) {
                formGroup.classList.remove(toggleClass)

                var formMessage = formGroup.querySelector(errorElement)
                if(formMessage) {
                    formMessage.innerText = '';
                }
            }
        }
        // console.log(formRules)

        formElement.onsubmit = function (event) {
            event.preventDefault();

            var isFormValid = true;

            for (var input of inputs) {
                var isValid = handleValidate({ target: input});

                if(!isValid) isFormValid = false;
            }

            //Khi form không có lỗi 
            if(isFormValid){
                if(typeof _this.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');

                    //vì formValues chưa có gì hết nên dùng reduce
                    var formValues = Array.from(enableInputs).reduce((values,input)=>{
                            switch(input.type) {
                                case 'radio':
                                    var isHasChecked = formElement.querySelector('input[name="":checked]');
                                    if(isHasChecked) {
                                        values[input.name] = isHasChecked.value;
                                    }else{
                                        values[input.name] = ''
                                    }
                                    break;
                                case 'checkbox':
                                    if(input.matches(':checked')) {
                                        if(!Array.isArray( values[input.name])) {
                                            values[input.name] = []
                                        }

                                        values[input.name].push(input.value)
                                    } else if(!values[input.name]) {
                                        values[input.name] = ''
                                    }
                                    break;
                                    case 'file':
                                        values[input.name] = input.files
                                        break;
                                    default:
                                        values[input.name] = input.value
                            }
                            return values
                    },{})

                    //Gọi hàm onSubmit và trả về các giá trị của form
                    _this.onSubmit(formValues)
                }else {
                    formElement.submit();
                }
            } 
        }
    }


}