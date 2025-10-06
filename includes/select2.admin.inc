<?php
/**
 * @file
 * Admin forms for Select2.
 */

/**
 * Implements hook_form().
 */
function select2_settings_form($form, &$form_state) {
  $config = config('select2.settings');

  $form['setting_vtabs'] = array(
    '#type' => 'vertical_tabs',
  );

  $form['setting_vtabs']['loading_rules'] = array(
    '#type' => 'fieldset',
    '#title' => 'Loading rules',
  );

  $form['setting_vtabs']['loading_rules']['compression_type'] = array(
    '#type' => 'radios',
    '#title' => t('Compression level'),
    '#options' => array(
      'minified' => t('Production (Minified)'),
      'source' => t('Development (Uncompressed Code)'),
    ),
    '#default_value' => $config->get('compression_type', 'minified'),
  );

  $form['setting_vtabs']['loading_rules']['update_settings_by_ajax'] = array(
    '#title' => t('Update settings by Ajax'),
    '#description' => t('This option can be used when the cache is enabled for pages.
<b>After enabling/disabling your current cache will be cleared</b>.'),
    '#type' => 'checkbox',
    '#default_value' => $config->get('update_settings_by_ajax', FALSE),
  );

  $form['setting_vtabs']['loading_rules']['use_for_all_select_elements'] = array(
    '#type' => 'checkbox',
    '#title' => t('Use for all &lt;select&gt; elements on the front end'),
    '#default_value' => $config->get('use_for_all_select_elements', FALSE),
  );

  $form['setting_vtabs']['loading_rules']['use_for_all_select_elements_for_admin_pages'] = array(
    '#type' => 'checkbox',
    '#title' => t('Use for all &lt;select&gt; elements on admin pages'),
    '#default_value' => $config->get('use_for_all_select_elements_for_admin_pages', FALSE),
    '#states' => array(
      'invisible' => array(
        ':input[name="select2_use_for_all_select_elements"]' => array('checked' => FALSE),
      ),
    ),
  );

  $form['setting_vtabs']['loading_rules']['use_for_ac_elements'] = array(
    '#type' => 'checkbox',
    '#title' => t('Use Select2 for elements with autocomplete (e.g. Tags)'),
    '#default_value' => $config->get('use_for_ac_elements', FALSE),
  );

  $form['setting_vtabs']['excluded_elements'] = array(
    '#type' => 'fieldset',
    '#title' => t('Exclusion rules'),
    '#collapsible' => 1,
    '#collapsed' => 1,
    '#description' => t('Exclude the following from using the Select2 plugin:'),
  );

  $form['setting_vtabs']['excluded_elements']['excluded_paths'] = array(
    '#type' => 'textarea',
    '#title' => t('Paths'),
    '#default_value' => $config->get('excluded_paths', ''),
    '#description' => t('Specify pages by using their paths.
Enter one path per line. The <em>*</em> character is a wildcard. Example paths are %blog for the blog page and %blog-wildcard for every personal blog. %front is the front page.', array('%blog' => 'blog', '%blog-wildcard' => 'blog/*', '%front' => '<front>')),
  );

  $form['setting_vtabs']['excluded_elements']['excluded_ids'] = array(
    '#type' => 'textarea',
    '#title' => t("IDs"),
    '#default_value' => $config->get('excluded_ids', ''),
    '#description' => t('Enter one per line, either an ID (not including the <em>#</em> symbol), or a RegEx (wrapped in <em>#</em>\'s). For example:<br/>
      <ul>
        <li>
          <em>edit-menu-weight</em> will exclude an element with id="edit-menu-weight".
        </li>
        <li>
          <em>#^edit-menu-#</em> will exclude all elements that have the id attribute with a value beginning exactly with "edit-menu-".
        </li>
      </ul>'
    ),
  );

  $form['setting_vtabs']['excluded_elements']['excluded_classes'] = array(
    '#type' => 'textarea',
    '#title' => t('Classes'),
    '#default_value' => $config->get('excluded_classes', ''),
    '#description' => t('Enter one class name per line (without dots and spaces). For example:<br />
      <ul>
        <li>
          <em>menu-parent-select</em> will exclude an element with class="menu-parent-select".
        </li>
      </ul>'
    ),
  );

  $form['setting_vtabs']['excluded_elements']['excluded_selectors'] = array(
    '#type' => 'textarea',
    '#title' => t('Selectors'),
    '#default_value' => $config->get('excluded_selectors', ''),
    '#description' => t('Enter one selector per line. For example:<br />
      <ul>
        <li>
          <em>.form-item select</em>  will exclude all <em>select</em> elements which have parents with a <em>form-item</em> class.
        </li>
      </ul>'
    ),
  );

  $form['setting_vtabs']['default_settings'] = array(
    '#type' => 'fieldset',
    '#title' => t('Default settings'),
    '#collapsible' => 1,
    '#collapsed' => 1,
  );

  $form['setting_vtabs']['default_settings']['min_options_count_for_search'] = array(
    '#type' => 'number',
    '#min' => 0,
    '#title' => t('Minimum number of options to enable Select2'),
    '#default_value' => $config->get('min_options_count_for_search', 15),
  );

  $form['setting_vtabs']['default_settings']['default_width'] = array(
    '#type' => 'select',
    '#title' => t('Default <em>width</em> property value'),
    '#default_value' => $config->get('default_width', 'element'),
    '#options' => array(
      'off' => 'Off',
      'element' => 'Element',
      'copy' => 'Copy',
      'resolve' => 'Resolve',
      'auto' => 'Auto',
    ),
    '#description' => t('Values description:
<ul>
<li><b>Off</b> - No width attribute will be set. Keep in mind that the container div copies classes from the source element so setting the width attribute may not always be necessary.</li>
<li><b>Element</b> - Uses javascript to calculate the width of the source element.</li>
<li><b>Copy</b> - Copies the value of the width style attribute set on the source element.</li>
<li><b>Resolve</b> - First attempts to <em>copy</em> than falls back on <em>element</em>.</li>
<li><b>Auto</b> - Sets width to <em>auto</em>.</li>
</ul>'),
  );

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array('#type' => 'submit', '#value' => t('Save configuration'));

  if (!empty($_POST) && form_get_errors()) {
    backdrop_set_message(t('The settings have not been saved because of the errors.'), 'error');
  }
  $form['#submit'][] = 'select2_settings_form_submit';
  if (!isset($form['#theme'])) {
    $form['#theme'] = 'system_settings_form';
  }


  return $form;
}

/**
 * Implements hook_form_submit().
 */
function select2_settings_form_submit($form, &$form_state) {
  $config = config('select2.settings');
  $values = $form_state['values'];
  $config
    ->set('compression_type', $values['compression_type'])
    ->set('update_settings_by_ajax', (bool) $values['update_settings_by_ajax'])
    ->set('use_for_ac_elements', (bool) $values['use_for_ac_elements'])
    ->set('use_for_all_select_elements', (bool) $values['use_for_all_select_elements'])
    ->set('use_for_all_select_elements_for_admin_pages', (bool) $values['use_for_all_select_elements_for_admin_pages'])
    ->set('excluded_ids', $values['excluded_ids'])
    ->set('excluded_classes', $values['excluded_classes'])
    ->set('excluded_paths', $values['excluded_paths'])
    ->set('excluded_selectors', $values['excluded_selectors'])
    ->set('default_width', $values['default_width'])
    ->set('min_options_count_for_search', (int) $values['min_options_count_for_search'])
    ->save();

  if ($form['setting_vtabs']['loading_rules']['update_settings_by_ajax']['#default_value'] != $form_state['values']['update_settings_by_ajax']) {
    backdrop_flush_all_caches();
    backdrop_set_message(t('Caches cleared.'));
  }
}
