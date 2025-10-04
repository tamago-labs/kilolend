'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '../BaseModal';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuyModal = ({ isOpen, onClose }: BuyModalProps) => {

    

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Buy Crypto">
            BUY MODAL
        </BaseModal>
    )
}