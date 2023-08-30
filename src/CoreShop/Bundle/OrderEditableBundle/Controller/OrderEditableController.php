<?php

declare(strict_types=1);

/*
 * CoreShop
 *
 * This source file is available under two different licenses:
 *  - GNU General Public License version 3 (GPLv3)
 *  - CoreShop Commercial License (CCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) CoreShop GmbH (https://www.coreshop.org)
 * @license    https://www.coreshop.org/license     GPLv3 and CCL
 *
 */

namespace CoreShop\Bundle\OrderEditableBundle\Controller;

use CoreShop\Bundle\ResourceBundle\Controller\ResourceController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class OrderEditableController extends ResourceController
{
    public function getConfigAction(Request $request): Response
    {
        $settings = [
            'order_editable' => $this->container->getParameter('coreshop.flags.order_editable'),
        ];

        return $this->viewHandler->handle($settings);
    }
}
