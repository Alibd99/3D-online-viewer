import bpy
import bmesh
import random

def build_bottle():
    # Create base circle and set up the bottle shell
    bpy.ops.mesh.primitive_circle_add(radius=1, enter_editmode=False, location=(0, 0, 0))
    bottle_shell = bpy.context.active_object
    bpy.ops.object.shade_smooth()
    bpy.ops.object.modifier_add(type='SUBSURF')
    subsurf = bottle_shell.modifiers["Subdivision"]
    subsurf.render_levels = 6
    subsurf.levels = 3

    body_length = random.uniform(1, 7)
    body_taper = random.uniform(0.1, 0.4)
    neck_length = random.uniform(0.5, 3)
    neck_taper_out = body_taper + random.uniform(1, 2)
    top_length = random.uniform(0.3, 0.9)

    print('body length:', body_length)
    print('body taper:', body_taper)
    print('neck length:', neck_length)
    print('neck taper out:', neck_taper_out)
    print('top length:', top_length)

    bpy.context.scene.eevee.use_ssr = True
    bpy.context.scene.eevee.use_ssr_refraction = True

    # Start editing the bottle
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(bottle_shell.data)
    extrude(0, 0, body_length)

    cleanup_bottom()
    liquid = make_liquid(body_length)

    # Select and switch back to object mode
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = bottle_shell

    # Continue bottle creation
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(bottle_shell.data)
    for v in bm.verts:
        if v.co[2] > body_length * 0.99:
            v.select = True
    bmesh.update_edit_mesh(bottle_shell.data)
    bpy.ops.object.editmode_toggle()
    bpy.ops.object.editmode_toggle()

    extrude(0, 0, 0)
    transform_resize(body_taper, body_taper, body_taper)
    extrude(0, 0, neck_length)
    extrude(0, 0, 0)
    transform_resize(neck_taper_out, neck_taper_out, neck_taper_out)
    extrude(0, 0, top_length)
    extrude(0, 0, 0)
    transform_resize(0.586486, 0.586486, 0.586486)
    extrude(0, 0, 0)
    bpy.ops.mesh.merge(type='CENTER')
    bpy.ops.object.mode_set(mode='OBJECT')

    set_up_glass_shader()

    # Set up liquid material
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = liquid
    set_up_liquid_shader()

    # Set bottle as parent object of liquid
    bpy.context.view_layer.objects.active = bottle_shell
    liquid.select_set(True)
    bpy.ops.object.parent_set(type='OBJECT', keep_transform=False)

def make_liquid(body_length):
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.duplicate()
    liquid = bpy.context.active_object
    transform_resize(0.9, 0.9, 0.9)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='DESELECT')
    bm = bmesh.from_edit_mesh(liquid.data)
    for v in bm.verts:
        if v.co[2] >= (body_length * 0.98):
            v.select = True
    bmesh.update_edit_mesh(liquid.data)
    bpy.ops.object.editmode_toggle()
    bpy.ops.object.editmode_toggle()
    extrude(0, 0, 0)
    transform_resize(0.5, 0.5, 0.5)
    extrude(0, 0, 0)
    bpy.ops.mesh.merge(type='CENTER')
    bpy.ops.object.mode_set(mode='OBJECT')
    transform_translate(0, 0, 0.08)
    return liquid

def set_up_liquid_shader():
    liquid_mat = bpy.data.materials.get("liquid_xyz")
    if liquid_mat is None:
        liquid_mat = bpy.data.materials.new(name="liquid_xyz")
    liquid_mat.use_nodes = True
    ob = bpy.context.object
    if ob.data.materials:
        ob.data.materials[0] = liquid_mat
    else:
        ob.data.materials.append(liquid_mat)

    nodes = liquid_mat.node_tree.nodes
    for node in nodes:
        nodes.remove(node)

    output_node = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')

    bsdf.inputs['Roughness'].default_value = 0.5
    random_color = (random.random(), random.random(), random.random(), 1)
    bsdf.inputs['Base Color'].default_value = random_color

    links = liquid_mat.node_tree.links
    links.new(bsdf.outputs['BSDF'], output_node.inputs['Surface'])

def set_up_glass_shader():
    glass_mat = bpy.data.materials.get("glass")
    if glass_mat is None:
        glass_mat = bpy.data.materials.new(name="glass")
    glass_mat.use_nodes = True
    ob = bpy.context.object
    if ob.data.materials:
        ob.data.materials[0] = glass_mat
    else:
        ob.data.materials.append(glass_mat)

    nodes = glass_mat.node_tree.nodes
    for node in nodes:
        nodes.remove(node)

    output_node = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')

    bsdf.inputs['Roughness'].default_value = 0.5
    random_color = (random.random(), random.random(), random.random(), 1)
    bsdf.inputs['Base Color'].default_value = random_color

    links = glass_mat.node_tree.links
    links.new(bsdf.outputs['BSDF'], output_node.inputs['Surface'])

def cleanup_bottom():
    bpy.ops.object.mode_set(mode='EDIT')
    mesh = bmesh.from_edit_mesh(bpy.context.object.data)
    bpy.ops.mesh.select_all(action='DESELECT')
    for v in mesh.verts:
        if v.co[2] == 0.0:
            v.select = True
    bmesh.update_edit_mesh(bpy.context.object.data)
    bpy.ops.object.editmode_toggle()
    bpy.ops.object.editmode_toggle()

    extrude(0, 0, 0)
    transform_resize(0.794349, 0.794349, 0.794349)
    extrude(0, 0, 0)
    bpy.ops.mesh.merge(type='CENTER')

def extrude(x, y, z):
    bpy.ops.mesh.extrude_region_move(MESH_OT_extrude_region={"use_normal_flip": False, "mirror": False},
                                     TRANSFORM_OT_translate={"value": (x, y, z),
                                                             "orient_type": 'GLOBAL',
                                                             "orient_matrix": ((1, 0, 0), (0, 1, 0), (0, 0, 1)),
                                                             "orient_matrix_type": 'GLOBAL',
                                                             "constraint_axis": (False, False, False), "mirror": False,
                                                             "use_proportional_edit": False,
                                                             "proportional_edit_falloff": 'SMOOTH',
                                                             "proportional_size": 1,
                                                             "use_proportional_connected": False,
                                                             "use_proportional_projected": False, "snap": False,
                                                             "snap_target": 'CLOSEST', "snap_point": (0, 0, 0),
                                                             "snap_align": False, "snap_normal": (0, 0, 0),
                                                             "gpencil_strokes": False, "cursor_transform": False,
                                                             "texture_space": False, "remove_on_cancel": False,
                                                             "release_confirm": False, "use_accurate": False})

def transform_resize(x, y, z):
    bpy.ops.transform.resize(value=(x, y, z), orient_type='GLOBAL',
                             orient_matrix=((1, 0, 0), (0, 1, 0), (0, 0, 1)), orient_matrix_type='GLOBAL', mirror=True,
                             use_proportional_edit=False, proportional_edit_falloff='SMOOTH', proportional_size=1,
                             use_proportional_connected=False, use_proportional_projected=False)

def transform_translate(x, y, z):
    bpy.ops.transform.translate(value=(x, y, z), orient_type='GLOBAL',
                                orient_matrix=((1, 0, 0), (0, 1, 0), (0, 0, 1)), orient_matrix_type='GLOBAL',
                                constraint_axis=(False, False, True), mirror=True, use_proportional_edit=False,
                                proportional_edit_falloff='SMOOTH', proportional_size=1,
                                use_proportional_connected=False, use_proportional_projected=False)

def clear_scene():
    if bpy.ops.object.mode_set.poll():
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def export_scene(export_path):
    try:
        bpy.ops.export_scene.gltf(filepath=export_path, export_format='GLB')
        print(f"Exported scene to {export_path}")
        return True
    except Exception as e:
        print(f"Error during export: {e}")
        return False

def perform_operations():
    clear_scene()
    build_bottle()
    export_path = "/home/alosh/projects1/exam/public/models/model.glb"
    return export_scene(export_path)

if __name__ == "__main__":
    result = perform_operations()
    if not result:
        print("Export failed")
