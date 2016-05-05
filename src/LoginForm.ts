import { createElement, Component, SyntheticEvent, ReactNode } from 'react'

export interface LoginFormData {
    login?: string
    password?: string
    remember?: boolean
    session?: string
}

export interface LoginFormProps extends LoginFormData {
    className?: string
    logo?: ReactNode
    submitting?: boolean
    error?: string,
    onLostPasswordClick?: (form: LoginFormData) => void
    onFormChange?: (form: LoginFormData) => void
    onFormSubmit?: (form: LoginFormData) => void
}

export class LoginForm extends Component<LoginFormProps, {}> {
    static defaultProps = {
        login: '',
        password: '',
        remember: false,
        logo: 'Logo',
        onFormChange: (e: LoginFormData) => console.log(e),
        onFormSubmit: (e: LoginFormData) => console.log(e),
        onRememberClick: (e: LoginFormData) => console.log(e),
    }

    constructor () {
        super()
        this.getFormData = this.getFormData.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleRemember = this.handleRemember.bind(this)
    }

    private getFormData (): LoginFormData {
        return {
            login: (this.refs['login'] as HTMLInputElement).value,
            password: (this.refs['password'] as HTMLInputElement).value,
            remember: (this.refs['remember'] as HTMLInputElement).checked,
            session: this.props.session,
        }
    }

    private handleChange () { this.props.onFormChange(this.getFormData()) }

    private handleSubmit (e: SyntheticEvent) {
        e.preventDefault()
        this.props.onFormSubmit(this.getFormData())
    }
    private handleRemember (e: SyntheticEvent) {
        e.preventDefault()
        this.props.onLostPasswordClick(this.getFormData())
    }

    render () {
        const className = 'LoginForm' + (this.props.className ? ` ${this.props.className}` : '')
        const {
            login,
            password,
            remember,
            logo,
            error,
            submitting,
        } = this.props

        const hasRemember = remember !== null
        const hasPasswordRestore = typeof this.props.onLostPasswordClick === 'function'

        return createElement('form', { className: className, onSubmit: this.handleSubmit },
            createElement('div', { className: 'LoginForm__logo' }, logo),
            createElement('label', { className: 'LoginForm__row LoginForm__input' },
                createElement('span', { className: 'LoginForm__label' }, 'Login'),
                createElement('input', { type: 'text', value: login, ref: 'login', onChange: this.handleChange })
            ),
            createElement('label', { className: 'LoginForm__row LoginForm__input' },
                createElement('span', { className: 'LoginForm__label' }, 'Password'),
                createElement('input', { type: 'password', value: password, ref: 'password', onChange: this.handleChange })
            ),
            error && createElement('div', { className: 'LoginForm__error' }, error),
            createElement('button', { className: 'LoginForm__row' }, submitting ? 'Submitting...' : 'Submit'),
            (hasRemember || hasPasswordRestore) && createElement('div', { className: 'LoginForm__footer LoginForm__row'},
                hasRemember && createElement('label', null,
                    createElement('input', {
                        type: 'checkbox',
                        checked: !!remember,
                        ref: 'remember',
                        onChange: this.handleChange,
                    }),
                    createElement('span', null, 'Remember me')),
                hasPasswordRestore && createElement('a', { onClick: this.handleRemember, href: '#' }, 'Lost password?')
            )
        )
    }
}

export default LoginForm
