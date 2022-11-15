const yup = require('yup')

const registerBodyValidation = async (body) => {
    const schema = yup.object().shape({
        name: yup.string().required('Hãy nhập Họ tên'),
        email: yup.string().required('Hãy nhập Tên đăng nhập'),
        password: yup.string().required('Hãy nhập Mật khẩu').min(6, 'Mật khẩu phải hơn 6 kí tự'),
        confirmPassword: yup
            .string()
            .required('Hãy nhập Mật khẩu xác nhận')
            .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp'),
    })
    return schema.validate(body).catch((error) => error)
}

const loginBodyValidation = async (body) => {
    const schema = yup.object().shape({
        email: yup.string().required('Hãy nhập Tên đăng nhập'),
        password: yup.string().required('Hãy nhập Mật khẩu').min(6, 'Mật khẩu phải hơn 6 kí tự'),
    })
    return schema.validate(body).catch((error) => error)
}

const refreshTokenBodyValidation = async (body) => {
    const schema = yup.object().shape({
        refreshToken: yup.string().required('Refresh token is required'),
    })
    return schema.validate(body).catch((error) => error)
}

module.exports = { registerBodyValidation, loginBodyValidation, refreshTokenBodyValidation }
