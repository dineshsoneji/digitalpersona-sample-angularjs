import { IComponentOptions } from 'angular';
import { Credential, BioSample } from '@digitalpersona/core';
import { IAuthService, ServiceError } from '@digitalpersona/services';
import { FaceAuth } from '@digitalpersona/authentication';

import { TokenAuth, Success } from '../tokenAuth';
import template from './faceAuth.html';

export default class FaceAuthControl extends TokenAuth
{
    public static readonly Component: IComponentOptions = {
        ...TokenAuth.Component,
        template,
        controller: FaceAuthControl,
    };

    private capturing: boolean = false;

    public static $inject = ["$scope", "AuthService"];
    constructor(
        private $scope: ng.IScope,
        private authService: IAuthService,
    ) {
        super(Credential.Face);
    }

    public toggleCapture() {
        this.capturing = !this.capturing;
//        this.$scope.$apply();
    }

    private handleStartCapture()
    {
    }
    private handleStopCapture()
    {
    }
    private handleCaptureError(error: Error) {
        super.notify(error);
    }

    private async handleCaptured(samples: BioSample[])
    {
        super.emitOnBusy();
        const auth = new FaceAuth(this.authService);
        try {
            const token = await (!this.user.name
                ? auth.identify(samples)                           // NOT SUPPORTED YET!
                : auth.authenticate(this.identity, samples));
            super.emitOnToken(token);
            super.notify(new Success('Face.Auth.Success'));
        } catch (error) {
            super.notify(new Error(this.mapServiceError(error)));
        } finally {
            this.$scope.$apply();
        }
    }

    protected mapServiceError(error: ServiceError) {
        switch (error.code) {
            case -2146893043:
            case -2003292320: return 'Face.Auth.Error.NoMatch';
            case -2146893042: return 'Face.Auth.Error.NotEnrolled';
            default: return super.mapServiceError(error);
        }
    }
}
