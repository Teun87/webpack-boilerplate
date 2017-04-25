<?php
/**
 * Laravel Mix plugin for Craft CMS
 *
 * Laravel Mix Variable
 *
 * @author    Tijs van Erp
 * @copyright Copyright (c) 2017 Tijs van Erp
 * @link      http://theconceptstore.nl
 * @package   LaravelMix
 * @since     1.0.0
 */

namespace Craft;
use Illuminate\Support\HtmlString;

use Illuminate\Support\Str;

class LaravelMixVariable
{
    public function hmr()
    {

        if (strpos($_SERVER['HTTP_HOST'], ":3000") >= 0) {
            return '<script src="http://localhost:8080/webpack-dev-server.js"></script>';
        }

        return '';
    }

    /**
     */
    public function mix($path)
    {
        static $manifest;

        $manifestDirectory = CRAFT_BASE_PATH . '../public/dist';

        if ($manifestDirectory && !starts_with($manifestDirectory, '/')) {
            $manifestDirectory = "/{$manifestDirectory}";
        }
        if (!$manifest) {
            if (!file_exists($manifestPath = $manifestDirectory . '/manifest.json')) {
                throw new Exception('The Mix manifest does not exist @ ' . $manifestPath);
            }
            $manifest = json_decode(file_get_contents($manifestPath), true);
        }
//        if (!starts_with($path, '/')) {
//            $path = "/{$path}";
//        }

//        $manifestForCraft = [];
//        foreach ($manifest as $key => $file) {
//            $key = starts_with($key, '/public/') ? str_replace_first("/public/", "/", $key) : $key;
//            $file = starts_with($file, '/public/') ? str_replace_first("/public/", "/", $file) : $file;
//            $manifestForCraft[$key] = $file;
//        }

        //Craft::dd($manifest);

        if (!array_key_exists($path, $manifest)) {
            throw new Exception(
                "Unable to locate Mix file: {$path}. Please check your " .
                'webpack.mix.js output paths and try again.'
            );
        }

//        $prefix = craft()->config->get('devMode') ? "" : "https://static.dibo.com";
        $prefix = craft()->config->get('assetPath') ?? '';

        return $prefix . $manifest[$path];
    }
}